import {
  AccountAddress,
  AttestedTransferReceipt,
  Chain,
  ChainAddress,
  ChainContext,
  CompletedTransferReceipt,
  Network,
  RedeemedTransferReceipt,
  Signer,
  TokenId,
  TransferState,
  Wormhole,
  WormholeMessageId,
  amount,
  canonicalAddress,
  chainToPlatform,
  finality,
  isAttested,
  isRedeemed,
  isSameToken,
  isSourceFinalized,
  isSourceInitiated,
  routes,
  signSendWait,
  toChainId,
  toUniversal,
  universalAddress,
} from "@wormhole-foundation/sdk-connect";
import { register as registerNttDefinitions } from "@wormhole-foundation/sdk-definitions-ntt";
import { register as registerEvmNtt } from "@wormhole-foundation/sdk-evm-ntt";
import { register as registerSolanaNtt } from "@wormhole-foundation/sdk-solana-ntt";
import { EvmNtt } from "@wormhole-foundation/sdk-evm-ntt";
import { SolanaNtt } from "@wormhole-foundation/sdk-solana-ntt";

import {
  addChainId,
  addFrom,
  EvmAddress,
  EvmChains,
  EvmPlatform,
  EvmUnsignedTransaction,
} from "@wormhole-foundation/sdk-evm";
import "@wormhole-foundation/sdk-solana";
import {
  nttExecutorRoute,
  NttExecutorRoute,
  NttRoute,
} from "@wormhole-foundation/sdk-route-ntt";
import { Contract, TransactionRequest } from "ethers";
import { Ntt, NttWithExecutor } from "@wormhole-foundation/sdk-definitions-ntt";
import {
  SolanaChains,
  SolanaUnsignedTransaction,
} from "@wormhole-foundation/sdk-solana";
import {
  Connection,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
} from "@solana/web3.js";
import {
  getScaledUiAmountConfig,
  TOKEN_2022_PROGRAM_ID,
  unpackMint,
} from "@solana/spl-token";
import evm from "@wormhole-foundation/sdk/platforms/evm";
import solana from "@wormhole-foundation/sdk/platforms/solana";
import { getExecutorConfig } from "./executor";
import { SolanaRouter } from "./svm";

type Op = NttRoute.Options;
type Tp = routes.TransferParams<Op>;
type Vr = routes.ValidationResult<Op>;

type Vp = NttRoute.ValidatedParams;
type QR = routes.QuoteResult<Op, Vp>;
type Q = routes.Quote<Op, Vp>;

type R = NttRoute.AutomaticTransferReceipt;

type Contracts = Ntt.Contracts & { mLikeTokens: string[] };

export class M0AutomaticRoute<N extends Network>
  extends routes.AutomaticRoute<N, Op, Vp, R>
  implements routes.StaticRouteMethods<typeof M0AutomaticRoute>
{
  static {
    // Register NTT protocol handlers with the SDK
    registerNttDefinitions();
    registerEvmNtt();
    registerSolanaNtt();
  }

  // ntt does not support gas drop-off currently
  static NATIVE_GAS_DROPOFF_SUPPORTED: boolean = false;

  // USDZ token address is the same across Ethereum and Arbitrum
  static EVM_USDZ_TOKEN = "0xA4B6DF229AEe22b4252dc578FEB2720E8A2C4A56";

  // Wrapped M token address is the same on EVM chains
  static EVM_WRAPPED_M_TOKEN = "0x437cc33344a0B27A429f795ff6B469C72698B291";

  static EXECUTOR_ENTRYPOINT = "0x22f04a6cd935bfa3b4d000a4e3d4079adb148198";

  // Contract addresses are the same on all EVM chains
  static EVM_CONTRACTS: Contracts = {
    // M token address is the same on EVM chains
    token: "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b",
    // Wrapped $M and Extension Tokens that can bridged by unwrapping to $M
    mLikeTokens: [this.EVM_WRAPPED_M_TOKEN, this.EVM_USDZ_TOKEN],
    // M0 Portal address is the same on EVM chains
    manager: "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd",
    // Wormhole transceiver address is the same on EVM chains
    transceiver: { wormhole: "0x0763196A091575adF99e2306E5e90E0Be5154841" },
  };

  static meta = { name: "M0AutomaticRoute", provider: "M0" };

  static supportedNetworks(): Network[] {
    return ["Mainnet", "Testnet"];
  }

  static isPlatformSupported(platform: string): boolean {
    return platform == "Evm" || platform == "Solana";
  }

  static supportedChains(network: Network): Chain[] {
    switch (network) {
      case "Mainnet":
        return ["Ethereum", "Arbitrum", "Optimism", "Base", "Solana", "Fogo"];
      case "Testnet":
        return [
          "Sepolia",
          "ArbitrumSepolia",
          "OptimismSepolia",
          "BaseSepolia",
          "Solana",
          "Fogo",
        ];
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  static getContracts(chainContext: ChainContext<Network>): Contracts {
    switch (chainContext.chain) {
      case "Ethereum":
      case "Optimism":
      case "Arbitrum":
      case "Base":
      case "Sepolia":
      case "OptimismSepolia":
      case "ArbitrumSepolia":
      case "BaseSepolia":
        return this.EVM_CONTRACTS;
      case "Solana":
      case "Fogo":
        return SolanaRoutes.getSolanaContracts(
          chainContext.network,
          chainContext.chain,
        );
      default:
        throw new Error(`Unsupported chain: ${chainContext.chain}`);
    }
  }

  static async supportedSourceTokens(
    fromChain: ChainContext<Network>,
  ): Promise<TokenId[]> {
    const { token, mLikeTokens } = this.getContracts(fromChain);
    return [
      Wormhole.tokenId(fromChain.chain, token),
      ...mLikeTokens.map((x) => Wormhole.tokenId(fromChain.chain, x)),
    ];
  }

  static async supportedDestinationTokens<N extends Network>(
    token: TokenId,
    fromChain: ChainContext<N>,
    toChain: ChainContext<N>,
  ): Promise<TokenId[]> {
    const sourceTokens = await this.supportedSourceTokens(fromChain);
    if (!sourceTokens.some((t) => isSameToken(t, token))) {
      return [];
    }

    const { token: mToken, mLikeTokens } = this.getContracts(toChain);
    const tokens = mLikeTokens.map((x) => Wormhole.tokenId(toChain.chain, x));

    // SVM chains cannot receive $M directly
    if (toChain.chain === "Solana" || toChain.chain === "Fogo") {
      return tokens;
    }

    return [...tokens, Wormhole.tokenId(toChain.chain, mToken)];
  }

  static isProtocolSupported<N extends Network>(
    chain: ChainContext<N>,
  ): boolean {
    return chain.supportsProtocol("Ntt");
  }

  getDefaultOptions(): Op {
    return NttRoute.AutomaticOptions;
  }

  async isAvailable(request: routes.RouteTransferRequest<N>): Promise<boolean> {
    const ntt = await request.fromChain.getProtocol("Ntt", {
      ntt: M0AutomaticRoute.getContracts(request.fromChain),
    });

    return ntt.isRelayingAvailable(request.toChain.chain);
  }

  async validate(
    request: routes.RouteTransferRequest<N>,
    params: Tp,
  ): Promise<Vr> {
    const options = params.options ?? this.getDefaultOptions();

    const parsedAmount = amount.parse(params.amount, request.source.decimals);
    // The trimmedAmount may differ from the parsedAmount if the parsedAmount includes dust
    const trimmedAmount = NttRoute.trimAmount(
      parsedAmount,
      request.destination.decimals,
    );

    const fromContracts = M0AutomaticRoute.getContracts(request.fromChain);
    const toContracts = M0AutomaticRoute.getContracts(request.toChain);

    const validatedParams: Vp = {
      amount: params.amount,
      normalizedParams: {
        amount: trimmedAmount,
        sourceContracts: fromContracts,
        destinationContracts: toContracts,
        options: {
          queue: false,
          automatic: true,
        },
      },
      options,
    };
    return { valid: true, params: validatedParams };
  }

  async quote(
    request: routes.RouteTransferRequest<N>,
    params: Vp,
  ): Promise<QR> {
    const { fromChain, toChain } = request;
    const ntt = await fromChain.getProtocol("Ntt", {
      ntt: M0AutomaticRoute.getContracts(fromChain),
    });

    if (!(await ntt.isRelayingAvailable(toChain.chain))) {
      return {
        success: false,
        error: new Error(`Relaying to chain ${toChain.chain} is not available`),
      };
    }

    const deliveryPrice = await ntt.quoteDeliveryPrice(
      toChain.chain,
      params.normalizedParams.options,
    );

    const dstAmount = amount.scale(
      params.normalizedParams.amount,
      request.destination.decimals,
    );

    const result: QR = {
      success: true,
      params,
      sourceToken: {
        token: request.source.id,
        amount: params.normalizedParams.amount,
      },
      destinationToken: {
        token: request.destination.id,
        amount: dstAmount,
      },
      relayFee: {
        token: Wormhole.tokenId(fromChain.chain, "native"),
        amount: amount.fromBaseUnits(
          deliveryPrice,
          fromChain.config.nativeTokenDecimals,
        ),
      },
      destinationNativeGas: amount.fromBaseUnits(
        0n,
        toChain.config.nativeTokenDecimals,
      ),
      eta: finality.estimateFinalityTime(request.fromChain.chain),
    };

    return result;
  }

  async initiate(
    request: routes.RouteTransferRequest<N>,
    signer: Signer,
    quote: Q,
    to: ChainAddress,
  ): Promise<R> {
    const { params } = quote;
    const { fromChain } = request;
    const sender = Wormhole.parseAddress(signer.chain(), signer.address());
    const platform = chainToPlatform(fromChain.chain);
    const transferAmount = amount.units(params.normalizedParams.amount);
    const options = params.normalizedParams.options;

    if (!M0AutomaticRoute.isPlatformSupported(platform))
      throw new Error(`Unsupported platform ${platform}`);

    const ntt = await fromChain.getProtocol("Ntt", {
      ntt: M0AutomaticRoute.getContracts(fromChain),
    });

    const sourceToken = canonicalAddress(request.source.id);
    const destinationToken = canonicalAddress(request.destination.id);

    const initXfer =
      platform === "Evm"
        ? // for EVM call transferMLike function
          this.transferMLike(
            ntt as EvmNtt<N, EvmChains>,
            // @ts-ignore
            sender,
            transferAmount,
            to,
            sourceToken,
            destinationToken,
            options,
          )
        : // for Solana use custom transfer instruction
          this.transferSolanaExtension(
            ntt as SolanaNtt<N, SolanaChains>,
            // @ts-ignore
            sender,
            transferAmount,
            to,
            sourceToken,
            destinationToken,
          );

    const txids = await signSendWait(fromChain, initXfer, signer);

    return {
      from: fromChain.chain,
      to: to.chain,
      state: TransferState.SourceInitiated,
      originTxs: txids,
      params,
    };
  }

  /**
   * Modified from EvmNtt `transfer` function to call `transferMLikeToken` instead
   * https://github.com/wormhole-foundation/native-token-transfers/blob/main/evm/ts/src/ntt.ts#L461
   */
  async *transferMLike<N extends Network, C extends EvmChains>(
    ntt: EvmNtt<N, C>,
    sender: AccountAddress<C>,
    amount: bigint,
    destination: ChainAddress,
    sourceToken: string,
    destinationToken: string,
    options: Ntt.TransferOptions,
  ): AsyncGenerator<EvmUnsignedTransaction<N, C>> {
    const senderAddress = new EvmAddress(sender).toString();

    //TODO check for ERC-2612 (permit) support on token?
    const tokenContract = EvmPlatform.getTokenImplementation(
      ntt.provider,
      sourceToken,
    );

    const spenderAddress = this.requiresExecutor(destination.chain)
      ? M0AutomaticRoute.EXECUTOR_ENTRYPOINT
      : ntt.managerAddress;

    const allowance = await tokenContract.allowance(
      senderAddress,
      spenderAddress,
    );

    if (allowance < amount) {
      const txReq = await tokenContract.approve.populateTransaction(
        spenderAddress,
        amount,
      );
      yield this.createUnsignedTx(
        ntt,
        addFrom(txReq, senderAddress),
        "Ntt.Approve",
      );
    }

    const receiver = universalAddress(destination);

    // Request relay through executor
    if (this.requiresExecutor(destination.chain)) {
      const quote = await this.getExecutorQuote(
        ntt.chain,
        destination.chain,
        amount,
      );

      const contract = new Contract(M0AutomaticRoute.EXECUTOR_ENTRYPOINT, [
        "function transferMLikeToken(uint256 amount, address sourceToken, uint16 destinationChainId, bytes32 destinationToken, bytes32 recipient, bytes32 refundAddress, (uint256 value, address refundAddress, bytes signedQuote, bytes instructions) executorArgs, bytes memory transceiverInstructions) external payable returns (bytes32 messageId)",
      ]);

      const executorArgs = {
        value: quote.estimatedCost,
        refundAddress: senderAddress,
        signedQuote: quote.signedQuote,
        instructions: quote.relayInstructions,
      };

      const txReq = await contract
        .getFunction("transferMLikeToken")
        .populateTransaction(
          amount,
          sourceToken,
          toChainId(destination.chain),
          toUniversal(destination.chain, destinationToken).toString(),
          receiver,
          receiver,
          executorArgs,
          Uint8Array.from(Buffer.from("01000101", "hex")),
          { value: quote.estimatedCost },
        );

      yield ntt.createUnsignedTx(addFrom(txReq, senderAddress), "Ntt.transfer");
      return;
    }

    const contract = new Contract(ntt.managerAddress, [
      "function transferMLikeToken(uint256 amount, address sourceToken, uint16 destinationChainId, bytes32 destinationToken, bytes32 recipient, bytes32 refundAddress, bytes memory transceiverInstructions) external payable returns (uint64 sequence)",
    ]);
    const txReq = await contract
      .getFunction("transferMLikeToken")
      .populateTransaction(
        amount,
        sourceToken,
        toChainId(destination.chain),
        toUniversal(destination.chain, destinationToken).toString(),
        receiver,
        receiver,
        Uint8Array.from(Buffer.from("00", "hex")),
        { value: await ntt.quoteDeliveryPrice(destination.chain, options) },
      );

    yield ntt.createUnsignedTx(addFrom(txReq, senderAddress), "Ntt.transfer");
  }

  createUnsignedTx<N extends Network, C extends EvmChains>(
    ntt: EvmNtt<N, C>,
    txReq: TransactionRequest,
    description: string,
    parallelizable: boolean = false,
  ): EvmUnsignedTransaction<N, C> {
    return new EvmUnsignedTransaction(
      addChainId(txReq, ntt.chainId),
      ntt.network,
      ntt.chain,
      description,
      parallelizable,
    );
  }

  async *transferSolanaExtension<N extends Network, C extends SolanaChains>(
    ntt: SolanaNtt<N, C>,
    sender: AccountAddress<C>,
    amount: bigint,
    recipient: ChainAddress,
    sourceToken: string,
    destinationToken: string,
  ): AsyncGenerator<SolanaUnsignedTransaction<N, C>> {
    const router = new SolanaRouter(ntt);
    const tokenSender = new PublicKey(sender.address);

    // Convert principal amount to UI amount if mint has scaled-ui config
    amount = await M0AutomaticRoute.applyScaledUiMultiplier(
      ntt.connection,
      new PublicKey(sourceToken),
      amount,
    );

    // Use custom transfer instruction (not NTT)
    const ixs = [
      await router.buildSendTokenInstruction(
        amount,
        tokenSender,
        sourceToken,
        destinationToken,
        recipient.chain,
        recipient.address.toString(),
      ),
    ];

    // Request relay
    ixs.push(
      await router.buildExecutorRelayInstruction(
        tokenSender,
        await this.getExecutorQuote(ntt.chain, recipient.chain, amount),
        recipient.chain,
      ),
    );

    // Get address table from Wormhole resolver
    const lut = await router.getAddressLookupTableAccounts();

    const messageV0 = new TransactionMessage({
      payerKey: tokenSender,
      instructions: ixs,
      recentBlockhash: (await ntt.connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message([lut]);

    yield ntt.createUnsignedTx(
      { transaction: new VersionedTransaction(messageV0) },
      "M0 Extension Bridge",
    );
  }

  public override async *track(receipt: R, timeout?: number) {
    const isEvmPlatform = (chain: Chain) => chainToPlatform(chain) === "Evm";

    if (isSourceInitiated(receipt) || isSourceFinalized(receipt)) {
      const { txid } = receipt.originTxs[receipt.originTxs.length - 1]!;
      const vaaType =
        isEvmPlatform(receipt.from) && isEvmPlatform(receipt.to)
          ? "Ntt:WormholeTransferStandardRelayer" // Automatic NTT transfers between EVM chains use standard relayers
          : "Ntt:WormholeTransfer";
      const vaa = await this.wh.getVaa(txid, vaaType, timeout);
      if (!vaa) {
        throw new Error(`No VAA found for transaction: ${txid}`);
      }

      const msgId: WormholeMessageId = {
        chain: vaa.emitterChain,
        emitter: vaa.emitterAddress,
        sequence: vaa.sequence,
      };

      receipt = {
        ...receipt,
        state: TransferState.Attested,
        attestation: {
          id: msgId,
          attestation: vaa,
        },
      } satisfies AttestedTransferReceipt<NttRoute.AutomaticAttestationReceipt> as R;

      yield receipt;
    }

    const toChain = this.wh.getChain(receipt.to);
    const ntt = await toChain.getProtocol("Ntt", {
      ntt: M0AutomaticRoute.getContracts(toChain),
    });

    if (isAttested(receipt)) {
      const {
        attestation: { attestation: vaa },
      } = receipt;

      if (await ntt.getIsApproved(vaa)) {
        receipt = {
          ...receipt,
          state: TransferState.DestinationInitiated,
          // TODO: check for destination event transactions to get dest Txids
        } satisfies RedeemedTransferReceipt<NttRoute.AutomaticAttestationReceipt>;
        yield receipt;
      }
    }

    if (isRedeemed(receipt)) {
      const {
        attestation: { attestation: vaa },
      } = receipt;
      const payload =
        vaa.payloadName === "WormholeTransfer"
          ? vaa.payload
          : vaa.payload["payload"];

      const isExecuted = isEvmPlatform(receipt.to)
        ? await (ntt as EvmNtt<N, EvmChains>).manager.isMessageExecuted(
            Ntt.messageDigest(vaa.emitterChain, payload["nttManagerPayload"]),
          )
        : await ntt.getIsExecuted(vaa);

      if (isExecuted) {
        receipt = {
          ...receipt,
          state: TransferState.DestinationFinalized,
        } satisfies CompletedTransferReceipt<NttRoute.AutomaticAttestationReceipt>;
        yield receipt;
      }
    }

    yield receipt;
  }

  private async getExecutorQuote(
    sourceChain: Chain,
    destinationChain: Chain,
    amount: bigint,
  ): Promise<NttWithExecutor.Quote> {
    const executorRoute = nttExecutorRoute(getExecutorConfig(this.wh.network));
    const routeInstance = new executorRoute(this.wh);

    const resolveM = (chain: Chain) => {
      if (chainToPlatform(chain) === "Solana") {
        const c = chain as SolanaChains;
        return SolanaRoutes.getSolanaContracts(this.wh.network, c).token;
      }
      return M0AutomaticRoute.EVM_CONTRACTS.token;
    };

    const transferRequest = await routes.RouteTransferRequest.create(this.wh, {
      source: Wormhole.tokenId(sourceChain, resolveM(sourceChain)),
      destination: Wormhole.tokenId(
        destinationChain,
        resolveM(destinationChain),
      ),
    });

    const validated = await routeInstance.validate(transferRequest, {
      amount: amount.toString(),
    });
    if (!validated.valid) {
      throw new Error(`Validation failed: ${validated.error.message}`);
    }

    return await routeInstance.fetchExecutorQuote(
      transferRequest,
      validated.params as NttExecutorRoute.ValidatedParams,
    );
  }

  private requiresExecutor(destination: Chain): boolean {
    // Other SVM chains like Fogo are marked as Solana
    return chainToPlatform(destination) === "Solana";
  }

  static async applyScaledUiMultiplier(
    connection: Connection,
    mint: PublicKey,
    amount: bigint,
  ): Promise<bigint> {
    const mintAccountInfo = await connection.getAccountInfo(mint);
    if (
      !mintAccountInfo ||
      !mintAccountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
    ) {
      return amount;
    }

    const mintData = unpackMint(mint, mintAccountInfo, TOKEN_2022_PROGRAM_ID);
    const scaledUiAmountConfig = getScaledUiAmountConfig(mintData);
    if (!scaledUiAmountConfig) {
      return amount;
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const multiplier =
      now >= scaledUiAmountConfig.newMultiplierEffectiveTimestamp
        ? scaledUiAmountConfig.newMultiplier
        : scaledUiAmountConfig.multiplier;

    const PRECISION = 10n ** 12n;
    const scaledMultiplier = BigInt(Math.round(multiplier * Number(PRECISION)));
    return (amount * scaledMultiplier) / PRECISION;
  }
}
