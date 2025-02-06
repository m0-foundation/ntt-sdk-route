import { AccountAddress, amount, ChainAddress, chainToPlatform, Network, routes, Signer, signSendWait, toChainId, TransferState, universalAddress, Wormhole } from "@wormhole-foundation/sdk-connect";
import { addChainId, addFrom, EvmAddress, EvmChains, EvmPlatform, EvmUnsignedTransaction } from "@wormhole-foundation/sdk-evm";
import { NttAutomaticRoute, NttRoute } from "@wormhole-foundation/sdk-route-ntt";
import { TransactionRequest } from "ethers";
import type { EvmNtt } from "@wormhole-foundation/sdk-evm-ntt";
import { Ntt } from "@wormhole-foundation/sdk-definitions-ntt";

type Op = NttRoute.Options;
type Vp = NttRoute.ValidatedParams;
type Q = routes.Quote<Op, Vp>;
type R = NttRoute.AutomaticTransferReceipt;

export class M0AutomaticRoute<N extends Network> extends NttAutomaticRoute<N> {

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
        const totalPrice = await ntt.quoteDeliveryPrice(
            destination.chain,
            options
        );

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
            yield this.createUnsignedTx(ntt, addFrom(txReq, senderAddress), "Ntt.Approve");
        }
        const receiver = universalAddress(destination);
        const txReq = await ntt.manager
            .getFunction("function transferMLikeToken(uint256 amount, address sourceToken, uint16 destinationChainId, bytes32 destinationToken, bytes32 recipient, bytes32 refundAddress) external payable returns (uint64 sequence)")
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

    async initiate(
        request: routes.RouteTransferRequest<N>,
        signer: Signer,
        quote: Q,
        to: ChainAddress
    ): Promise<R> {
        const { params } = quote;
        const { fromChain, toChain } = request;
        const sender = Wormhole.parseAddress(signer.chain(), signer.address());

        // TODO: check if platform is EVM
        const platform = chainToPlatform(fromChain.chain);

        const ntt = (await fromChain.getProtocol("Ntt", {
            ntt: params.normalizedParams.sourceContracts,
        })) as EvmNtt<N, EvmChains>;

        // TOD0: check if source or destination token is wrapped token
        const sourceTokenAddress = params.normalizedParams.sourceContracts.token;
        const destinationTokenAddress = params.normalizedParams.sourceContracts.token;

        const initXfer = this.transferMLike
            (ntt,
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
}