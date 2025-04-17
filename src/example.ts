import { Chain, ChainAddress, ChainContext, Network, Signer, Wormhole, chainToPlatform, canonicalAddress, routes, wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/platforms/evm";
import solana from "@wormhole-foundation/sdk/platforms/solana";
import '@wormhole-foundation/sdk-definitions-ntt';
import '@wormhole-foundation/sdk-evm-ntt';
import evmLoader from "@wormhole-foundation/sdk/evm";
import solanaLoader from "@wormhole-foundation/sdk/solana";
import { M0AutomaticRoute } from "./m0AutomaticRoute";
import 'dotenv/config'

export interface SignerStuff<N extends Network, C extends Chain> {
  chain: ChainContext<N, C>;
  signer: Signer<N, C>;
  address: ChainAddress<C>;
}

async function getSigner<N extends Network, C extends Chain>(
  chain: ChainContext<N, C>,
): Promise<SignerStuff<N, C>> {
  const platform = chainToPlatform(chain.chain);
  let signer: Signer;
  switch (platform) {
    case "Solana":
      signer = await solana.getSigner(
        await chain.getRpc(),
        process.env.SOLANA_PRIVATE_KEY!,
        { debug: false }
      );
      break;
    case "Evm":
      signer = await evm.getSigner(
        await chain.getRpc(),
        process.env.PRIVATE_KEY!
      );
      break;
    default:
      throw new Error("Unrecognized platform: " + platform);
  }

  return {
    chain,
    signer: signer as Signer<N, C>,
    address: Wormhole.chainAddress(chain.chain, signer.address()),
  };
}

(async function () {
  // Setup
  const wh = await wormhole("Testnet", [evmLoader, solanaLoader]);

  const src = wh.getChain("Sepolia");
  const dst = wh.getChain("Solana");

  const srcSigner = await getSigner(src);
  const dstSigner = await getSigner(dst);

  const resolver = wh.resolver([
    M0AutomaticRoute
  ]);

  const srcTokens = await resolver.supportedSourceTokens(src);
  console.log(
    "Allowed source tokens: ",
    srcTokens.map((t) => canonicalAddress(t))
  );
  // Just grab the first one
  const sendToken = srcTokens[0]!;

  // given the send token, what can we possibly get on the destination chain?
  const destTokens = await resolver.supportedDestinationTokens(
    sendToken,
    src,
    dst
  );
  console.log(
    "For the given source token and routes configured, the following tokens may be receivable: ",
    destTokens.map((t) => canonicalAddress(t))
  );
  //grab the first one for the example
  const destinationToken = destTokens[0]!;

  // creating a transfer request fetches token details
  // since all routes will need to know about the tokens
  const tr = await routes.RouteTransferRequest.create(wh, {
    source: sendToken,
    destination: destinationToken,
  });

  // resolve the transfer request to a set of routes that can perform it
  const foundRoutes = await resolver.findRoutes(tr);
  console.log(
    "For the transfer parameters, we found these routes: ",
    foundRoutes
  );

  // Taking the first route here, they'll be sorted by output amount
  // but you can chose any of them
  const bestRoute = foundRoutes[0]!;
  console.log("Selected: ", bestRoute);

  // Figure out what options are available
  const options = bestRoute.getDefaultOptions();
  console.log("This route offers the following default options", options);

  // Validate the transfer params passed
  // This fetches the next bits of data necessary and parses amounts or other values
  // it returns a new type: `ValidatedTransferParams`.
  // This is a validated version of the input params which must be passed to the next step
  const validated = await bestRoute.validate(tr, {
    amount: "0.00001",
    options,
  });
  if (!validated.valid) throw validated.error;
  console.log("Validated parameters: ", validated.params);

  // Fetch quote for the transfer
  // this, too, returns a new type that must be passed to the next step (if you like the quote)
  const quote = await bestRoute.quote(tr, validated.params);
  if (!quote.success) throw quote.error;
  console.log("Quote for transfer: ", quote);
  console.log("SourceToken: ", quote.sourceToken.token.address);
  console.log("DestToken: ", quote.destinationToken.token.address);

  // Now the transfer may be initiated
  // A receipt will be returned, guess what you gotta do with that?
  const receipt = await bestRoute.initiate(
    tr,
    srcSigner.signer,
    quote,
    dstSigner.address
  );
  console.log("Initiated transfer with receipt: ", receipt);

  // Kick off a wait log and executor
  // If there is an opportunity to advance it to the next step, it will take it
  // ie complete or finalize
  // see the implementation for how this works
  await routes.checkAndCompleteTransfer(bestRoute, receipt, dstSigner.signer);
})();