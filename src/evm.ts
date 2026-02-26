import {
  Chain,
  ChainContext,
  chainToPlatform,
  Network,
  TokenId,
  UniversalAddress,
} from "@wormhole-foundation/sdk-connect";
import { Contract, ContractTransaction, type Provider } from "ethers";
import { evmPortalProvider } from "./artifacts";
import { getM0ChainId } from "./chainIds";
import { NttWithExecutor } from "@wormhole-foundation/sdk-definitions-ntt";
import { PublicKey } from "@solana/web3.js";

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export class EvmRouter {
  private static instance: EvmRouter | null = null;

  private WORMHOLE_ADAPTER = "0xeAae496BcDa93cCCd3fD6ff6096347979e87B153";
  private static PORTAL_ADDRESS = "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd";

  private TOKENS = [
    "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b", // $M
    "0x437cc33344a0B27A429f795ff6B469C72698B291", // wM
    "0xA4B6DF229AEe22b4252dc578FEB2720E8A2C4A56", // USDZ
  ];

  constructor(
    private provider: Provider,
    public chain: Chain,
    public network: Exclude<Network, "Devnet">,
  ) {}

  async getSupportedSourceTokens(): Promise<TokenId[]> {
    return this.TOKENS.map((token) => ({
      chain: this.chain,
      address: new UniversalAddress(token, "hex"),
    }));
  }

  async getSupportedDestinationTokens(
    _sourceToken: string,
    toChain: Chain,
  ): Promise<TokenId[]> {
    if (toChain === "Solana") {
      return [
        {
          chain: toChain,
          address: new UniversalAddress(
            "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp",
            "base58",
          ),
        },
      ];
    }

    return this.TOKENS.map((token) => ({
      chain: toChain,
      address: new UniversalAddress(token, "hex"),
    }));
  }

  static async fromChainContext(ctx: ChainContext<Network>) {
    if (chainToPlatform(ctx.chain) !== "Evm") {
      throw new Error(`Unsupported evm chain: ${ctx.chain}`);
    }

    if (!EvmRouter.instance) {
      EvmRouter.instance = new EvmRouter(
        await ctx.getRpc(),
        ctx.chain,
        ctx.network as Exclude<Network, "Devnet">,
      );
    }

    return EvmRouter.instance;
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

    const recipientBytes32 = EvmRouter.stringToBytes32(recipient);
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
