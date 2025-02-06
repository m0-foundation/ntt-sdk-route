import { amount, ChainAddress, Network, routes, Signer, signSendWait, TransferState, Wormhole } from "@wormhole-foundation/sdk-connect";
import { NttAutomaticRoute, NttRoute } from "@wormhole-foundation/sdk-route-ntt";

type Op = NttRoute.Options;
type Vp = NttRoute.ValidatedParams;
type Q = routes.Quote<Op, Vp>;
type R = NttRoute.AutomaticTransferReceipt;

export class M0AutomaticRoute<N extends Network> extends NttAutomaticRoute<N> {
    async initiate(
        request: routes.RouteTransferRequest<N>,
        signer: Signer,
        quote: Q,
        to: ChainAddress
    ): Promise<R> {
        const { params } = quote;
        const { fromChain } = request;
        const sender = Wormhole.parseAddress(signer.chain(), signer.address());

        const ntt = await fromChain.getProtocol("Ntt", {
            ntt: params.normalizedParams.sourceContracts,
        });

        const initXfer = ntt.transfer(
            sender,
            amount.units(params.normalizedParams.amount),
            to,
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