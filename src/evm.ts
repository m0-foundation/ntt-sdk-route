import {
  Chain,
  ChainContext,
  chainToPlatform,
  Network,
  TokenId,
} from "@wormhole-foundation/sdk-connect";
import { Contract, ContractTransaction, type Provider } from "ethers";
import { evmPortalProvider } from "./artifacts";
import { getM0ChainId } from "./chainIds";
import { NttWithExecutor } from "@wormhole-foundation/sdk-definitions-ntt";
import { PublicKey } from "@solana/web3.js";
import { knownSourceTokens, knownTokensOn, toTokenIds } from "./tokens";

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const MULTICALL3_ABI = [
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) view returns ((bool success, bytes returnData)[])",
];

/** How long a resolved destination-token set stays warm. */
const PATH_CACHE_TTL_MS = 30_000;

export class EvmRouter {
  /**
   * One router per (network, chain). A bare singleton would hand the second chain
   * touched a provider bound to the first, silently reading balances and
   * allowances from the wrong chain.
   */
  private static instances = new Map<string, EvmRouter>();

  private WORMHOLE_ADAPTER = "0xaCffEC28C4eEe21C889a4e6C0704c540Ed9D4fDd";
  private static PORTAL_ADDRESS = "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd";

  private pathCache = new Map<string, { expiresAt: number; tokens: string[] }>();

  constructor(
    private provider: Provider,
    public chain: Chain,
    public network: Exclude<Network, "Devnet">,
  ) {}

  static async fromChainContext(ctx: ChainContext<Network>) {
    if (chainToPlatform(ctx.chain) !== "Evm") {
      throw new Error(`Unsupported evm chain: ${ctx.chain}`);
    }

    const key = `${ctx.network}:${ctx.chain}`;
    let instance = EvmRouter.instances.get(key);
    if (!instance) {
      instance = new EvmRouter(
        await ctx.getRpc(),
        ctx.chain,
        ctx.network as Exclude<Network, "Devnet">,
      );
      EvmRouter.instances.set(key, instance);
    }

    return instance;
  }

  async getSupportedSourceTokens(): Promise<TokenId[]> {
    return toTokenIds(this.chain, knownSourceTokens(this.network, this.chain));
  }

  /**
   * Destination tokens the Portal will actually accept for `sourceToken`.
   *
   * Candidates come from `src/tokens.ts`; the answer comes from the Portal.
   * `Portal.sendToken` reverts with `UnsupportedBridgingPath` for anything not
   * registered, so returning an unchecked list makes the route resolve for
   * transfers that cannot succeed.
   */
  async getSupportedDestinationTokens(
    sourceToken: string,
    toChain: Chain,
  ): Promise<TokenId[]> {
    const cacheKey = `${sourceToken.toLowerCase()}:${toChain}`;
    const cached = this.pathCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return toTokenIds(toChain, cached.tokens);
    }

    const candidates = knownTokensOn(this.network, toChain);
    if (candidates.length === 0) return [];

    const supported = await this.filterSupportedPaths(sourceToken, toChain, candidates);
    this.pathCache.set(cacheKey, {
      expiresAt: Date.now() + PATH_CACHE_TTL_MS,
      tokens: supported,
    });

    return toTokenIds(toChain, supported);
  }

  /** Narrows `candidates` to those registered on the Portal, in one Multicall3 round trip. */
  async filterSupportedPaths(
    sourceToken: string,
    toChain: Chain,
    candidates: string[],
  ): Promise<string[]> {
    const portal = evmPortalProvider(this.provider);
    const destinationChainId = getM0ChainId(toChain, this.network);

    const calls = candidates.map((token) => ({
      target: EvmRouter.PORTAL_ADDRESS,
      allowFailure: true,
      callData: portal.interface.encodeFunctionData("supportedBridgingPath", [
        sourceToken,
        destinationChainId,
        EvmRouter.stringToBytes32(token),
      ]),
    }));

    try {
      const multicall = new Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, this.provider);
      const results: Array<{ success: boolean; returnData: string }> =
        await multicall.aggregate3(calls);
      return candidates.filter((_, i) => {
        const result = results[i];
        return !!result?.success && BigInt(result.returnData) === 1n;
      });
    } catch {
      // No Multicall3, or the call was rejected — fall back to individual reads
      // rather than returning an unchecked list.
      const checks = await Promise.all(
        candidates.map((token) => this.isSupportedPath(sourceToken, toChain, token)),
      );
      return candidates.filter((_, i) => checks[i]);
    }
  }

  /** Single-path check, used to gate a transfer immediately before quoting it. */
  async isSupportedPath(
    sourceToken: string,
    toChain: Chain,
    destinationToken: string,
  ): Promise<boolean> {
    try {
      return await evmPortalProvider(this.provider).supportedBridgingPath(
        sourceToken,
        getM0ChainId(toChain, this.network),
        EvmRouter.stringToBytes32(destinationToken),
      );
    } catch {
      return false;
    }
  }

  async isSendPaused(): Promise<boolean> {
    try {
      return await evmPortalProvider(this.provider).sendPaused();
    } catch {
      return false;
    }
  }

  async buildSendTokenTransaction(
    amount: bigint,
    sender: string,
    sourceToken: string,
    destinationToken: string,
    destinationChain: Chain,
    recipient: string,
    quote: NttWithExecutor.Quote,
  ): Promise<ContractTransaction> {
    const portal = evmPortalProvider(this.provider);

    const destinationTokenBytes32 = EvmRouter.stringToBytes32(destinationToken);

    const tx = await portal
      .getFunction(
        "sendToken(uint256,address,uint32,bytes32,bytes32,bytes32,address,bytes)",
      )
      .populateTransaction(
        amount,
        sourceToken,
        getM0ChainId(destinationChain, this.network),
        destinationTokenBytes32,
        EvmRouter.stringToBytes32(recipient),
        EvmRouter.stringToBytes32(sender), // refund address
        this.WORMHOLE_ADAPTER,
        quote.signedQuote,
      );

    tx.from = sender;
    tx.value = quote.estimatedCost;

    return tx;
  }

  async getSpendApproval(
    amount: bigint,
    sender: string,
    sourceToken: string,
  ): Promise<ContractTransaction | null> {
    const token = new Contract(sourceToken, ERC20_ABI, this.provider);

    const allowance: bigint = await token.allowance(
      sender,
      EvmRouter.PORTAL_ADDRESS,
    );

    if (allowance >= amount) {
      return null;
    }

    const tx = await token
      .getFunction("approve")
      .populateTransaction(EvmRouter.PORTAL_ADDRESS, amount);

    tx.from = sender;
    return tx;
  }

  static stringToBytes32(s: string) {
    if (s.startsWith("0x")) {
      const bytes = Buffer.from(s.replace("0x", ""), "hex");
      return Buffer.concat([Buffer.alloc(32 - bytes.length), bytes]);
    }
    return new PublicKey(s).toBytes();
  }
}
