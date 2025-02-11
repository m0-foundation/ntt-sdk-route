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
  chainToPlatform,
  finality,
  isAttested,
  isRedeemed,
  isSourceFinalized,
  isSourceInitiated,
  routes,
  signSendWait,
  toChainId,
  universalAddress,
} from "@wormhole-foundation/sdk-connect";
import "@wormhole-foundation/sdk-definitions-ntt";
import { EvmNtt } from "@wormhole-foundation/sdk-evm-ntt";
import {
  addChainId,
  addFrom,
  EvmAddress,
  EvmChains,
  EvmPlatform,
  EvmUnsignedTransaction,
} from "@wormhole-foundation/sdk-evm";
import { NttRoute } from "@wormhole-foundation/sdk-route-ntt";
import { TransactionRequest } from "ethers";
import { Ntt } from "@wormhole-foundation/sdk-definitions-ntt";

type Op = NttRoute.Options;
type Tp = routes.TransferParams<Op>;
type Vr = routes.ValidationResult<Op>;

type Vp = NttRoute.ValidatedParams;
type QR = routes.QuoteResult<Op, Vp>;
type Q = routes.Quote<Op, Vp>;

type R = NttRoute.AutomaticTransferReceipt;

type Contracts = Ntt.Contracts & { wrappedMToken: string };

export class M0AutomaticRoute<N extends Network>
  extends routes.AutomaticRoute<N, Op, Vp, R>
  implements routes.StaticRouteMethods<typeof M0AutomaticRoute>
{
  // ntt does not support gas drop-off currently
  static NATIVE_GAS_DROPOFF_SUPPORTED: boolean = false;

  // Contract addresses are the same on all EVM chains
  static MAINNET_CONTRACTS: Contracts = {
    // M token address is the same on EVM chains
    token: "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b",
    // Wrapped M token address is the same on EVM chains
    wrappedMToken: "0x437cc33344a0B27A429f795ff6B469C72698B291",
    // M0 Portal address is the same on EVM chains
    manager: "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd",
    // Wormhole transceiver address is the same on EVM chains
    transceiver: { wormhole: "0x0763196A091575adF99e2306E5e90E0Be5154841" },
  };

  // TODO: add testnet info
  static TESTNET_CONTRACTS: Contracts = {
    token: "",
    wrappedMToken: "",
    manager: "",
    transceiver: { wormhole: "" },
  };

  static meta = { name: "M0AutomaticNtt" };

  static supportedNetworks(): Network[] {
    return ["Mainnet", "Testnet"];
  }

  static supportedChains(): Chain[] {
    return [
      "Ethereum",
      "Arbitrum",
      "Optimism",
      "Sepolia",
      "ArbitrumSepolia",
      "OptimismSepolia",
    ];
  }

  static getContracts(chain: Chain): Contracts {
    switch (chain) {
      case "Ethereum":
        return this.MAINNET_CONTRACTS;
      case "Optimism":
        return this.MAINNET_CONTRACTS;
      case "Arbitrum":
        return this.MAINNET_CONTRACTS;
      case "Sepolia":
        return {
          token: "0x245902cAB620E32DF09DA4a26094064e096dd480",
          wrappedMToken: "0xe91A93a2B782781744a07118bab5855fb256b881",
          manager: "0xf1669804140fA31cdAA805A1B3Be91e6282D5e41",
          transceiver: {
            wormhole: "0xb1725758f7255B025cdbF2814Bc428B403623562",
          },
        };
      case "OptimismSepolia":
        return {
          token: "0x58582438ab47FfA2206570AC93E85B42640bef09",
          wrappedMToken: "0x71c72Ee9F587DAC1df749940c7581E4BbC789F85",
          manager: "0xf1669804140fA31cdAA805A1B3Be91e6282D5e41",
          transceiver: {
            wormhole: "0xb1725758f7255B025cdbF2814Bc428B403623562",
          },
        };
      case "ArbitrumSepolia":
        return {
          token: "0x58582438ab47FfA2206570AC93E85B42640bef09",
          wrappedMToken: "0x71c72Ee9F587DAC1df749940c7581E4BbC789F85",
          manager: "0xf1669804140fA31cdAA805A1B3Be91e6282D5e41",
          transceiver: {
            wormhole: "0xb1725758f7255B025cdbF2814Bc428B403623562",
          },
        };
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  static async supportedSourceTokens(
    fromChain: ChainContext<Network>
  ): Promise<TokenId[]> {
    const { token, wrappedMToken } = this.getContracts(fromChain.chain);
    return [
      Wormhole.tokenId(fromChain.chain, token),
      Wormhole.tokenId(fromChain.chain, wrappedMToken),
    ];
  }

  static async supportedDestinationTokens<N extends Network>(
    token: TokenId,
    fromChain: ChainContext<N>,
    toChain: ChainContext<N>
  ): Promise<TokenId[]> {
    const { token: mToken, wrappedMToken } = this.getContracts(toChain.chain);
    return [
      Wormhole.tokenId(toChain.chain, mToken),
      Wormhole.tokenId(toChain.chain, wrappedMToken),
    ];
  }

  static isProtocolSupported<N extends Network>(
    chain: ChainContext<N>
  ): boolean {
    return chain.supportsProtocol("Ntt");
  }

  getDefaultOptions(): Op {
    return NttRoute.AutomaticOptions;
  }

  async isAvailable(request: routes.RouteTransferRequest<N>): Promise<boolean> {
    const ntt = await request.fromChain.getProtocol("Ntt", {
      ntt: M0AutomaticRoute.getContracts(request.fromChain.chain)
    });

    return ntt.isRelayingAvailable(request.toChain.chain);
  }

  async validate(
    request: routes.RouteTransferRequest<N>,
    params: Tp
  ): Promise<Vr> {
    const options = params.options ?? this.getDefaultOptions();

    const gasDropoff = amount.parse(
      options.gasDropoff ?? "0.0",
      request.toChain.config.nativeTokenDecimals
    );

    const parsedAmount = amount.parse(params.amount, request.source.decimals);
    // The trimmedAmount may differ from the parsedAmount if the parsedAmount includes dust
    const trimmedAmount = NttRoute.trimAmount(
      parsedAmount,
      request.destination.decimals
    );

    const contracts = M0AutomaticRoute.getContracts(request.fromChain.chain);

    const validatedParams: Vp = {
      amount: params.amount,
      normalizedParams: {
        amount: trimmedAmount,
        sourceContracts: contracts,
        destinationContracts: contracts,
        options: {
          queue: false,
          automatic: true,
          gasDropoff: amount.units(gasDropoff),
        },
      },
      options,
    };
    return { valid: true, params: validatedParams };
  }

  async quote(
    request: routes.RouteTransferRequest<N>,
    params: Vp
  ): Promise<QR> {
    const { fromChain, toChain } = request;
    const ntt = await fromChain.getProtocol("Ntt", {
      ntt: M0AutomaticRoute.getContracts(fromChain.chain)
    });

    if (!(await ntt.isRelayingAvailable(toChain.chain))) {
      return {
        success: false,
        error: new Error(`Relaying to chain ${toChain.chain} is not available`),
      };
    }

    const deliveryPrice = await ntt.quoteDeliveryPrice(
      toChain.chain,
      params.normalizedParams.options
    );

    const dstAmount = amount.scale(
      params.normalizedParams.amount,
      request.destination.decimals
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
        params.normalizedParams.options.gasDropoff ?? 0n,
        toChain.config.nativeTokenDecimals
      ),
      eta: finality.estimateFinalityTime(request.fromChain.chain),
    };

    return result;
  }

  async initiate(
    request: routes.RouteTransferRequest<N>,
    signer: Signer,
    quote: Q,
    to: ChainAddress
  ): Promise<R> {
    const { params } = quote;
    const { fromChain } = request;
    const sender = Wormhole.parseAddress(signer.chain(), signer.address());

    if (chainToPlatform(fromChain.chain) !== "Evm")
      throw new Error("The route supports only EVM");

    const ntt = (await fromChain.getProtocol("Ntt", {
      ntt: M0AutomaticRoute.getContracts(fromChain.chain)
    })) as EvmNtt<N, EvmChains>;

    const sourceTokenAddress = params.normalizedParams.sourceContracts.token;
    const destinationTokenAddress =
      params.normalizedParams.sourceContracts.token;

    const initXfer = this.transferMLike(
      ntt,
      sender,
      amount.units(params.normalizedParams.amount),
      to,
      sourceTokenAddress,
      destinationTokenAddress,
      params.normalizedParams.options
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
    options: Ntt.TransferOptions
  ): AsyncGenerator<EvmUnsignedTransaction<N, C>> {
    const senderAddress = new EvmAddress(sender).toString();
    // Note: these flags are indexed by transceiver index
    const totalPrice = await ntt.quoteDeliveryPrice(destination.chain, options);

    //TODO check for ERC-2612 (permit) support on token?
    const tokenContract = EvmPlatform.getTokenImplementation(
      ntt.provider,
      ntt.tokenAddress
    );

    const allowance = await tokenContract.allowance(
      senderAddress,
      ntt.managerAddress
    );

    if (allowance < amount) {
      const txReq = await tokenContract.approve.populateTransaction(
        ntt.managerAddress,
        amount
      );
      yield this.createUnsignedTx(
        ntt,
        addFrom(txReq, senderAddress),
        "Ntt.Approve"
      );
    }

    const receiver = universalAddress(destination);
    const txReq = await ntt.manager
      .getFunction(
        "function transferMLikeToken(uint256 amount, address sourceToken, uint16 destinationChainId, bytes32 destinationToken, bytes32 recipient, bytes32 refundAddress) external payable returns (uint64 sequence)"
      )
      .populateTransaction(
        amount,
        sourceToken,
        toChainId(destination.chain),
        destinationToken,
        receiver,
        receiver,
        { value: totalPrice }
      );

    yield ntt.createUnsignedTx(addFrom(txReq, senderAddress), "Ntt.transfer");
  }

  createUnsignedTx<N extends Network, C extends EvmChains>(
    ntt: EvmNtt<N, C>,
    txReq: TransactionRequest,
    description: string,
    parallelizable: boolean = false
  ): EvmUnsignedTransaction<N, C> {
    return new EvmUnsignedTransaction(
      addChainId(txReq, ntt.chainId),
      ntt.network,
      ntt.chain,
      description,
      parallelizable
    );
  }

  public override async *track(receipt: R, timeout?: number) {
    if (isSourceInitiated(receipt) || isSourceFinalized(receipt)) {
      const { txid } = receipt.originTxs[receipt.originTxs.length - 1]!;

      const isEvmPlatform = (chain: Chain) => chainToPlatform(chain) === "Evm";
      const vaaType =
        isEvmPlatform(receipt.from) && isEvmPlatform(receipt.to)
          ? // Automatic NTT transfers between EVM chains use standard relayers
            "Ntt:WormholeTransferStandardRelayer"
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
      ntt: M0AutomaticRoute.getContracts(toChain.chain)
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

      if (await ntt.getIsExecuted(vaa)) {
        receipt = {
          ...receipt,
          state: TransferState.DestinationFinalized,
        } satisfies CompletedTransferReceipt<NttRoute.AutomaticAttestationReceipt>;
        yield receipt;
      }
    }

    yield receipt;
  }
}
