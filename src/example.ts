import { Chain, ChainContext, Network, Wormhole, canonicalAddress, routes, wormhole } from "@wormhole-foundation/sdk";

import evm from "@wormhole-foundation/sdk/evm";
// import solana from "@wormhole-foundation/sdk/solana";
import { Signer, Wallet, JsonRpcProvider} from 'ethers';
import { M0AutomaticRoute } from "./m0AutomaticRoute";
import 'dotenv/config'

async function getSigner<N extends Network, C extends Chain>(
    chain: ChainContext<N, C>,
  ): Promise<Signer> {
    if (process.env.PRIVATE_KEY == null)
        throw new Error("PRIVATE_KEY is not set");
    if (process.env.RPC_URL == null)
        throw new Error("RPC_URL is not set");
    return new Wallet(process.env.PRIVATE_KEY, new JsonRpcProvider(process.env.RPC_URL));
  }

(async function () {
  // Setup
  const wh = await wormhole("Testnet", [evm]);

  
  const src = wh.getChain("Sepolia");
  const dst = wh.getChain("OptimismSepolia");

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
  //if (!quote.success) throw quote.error;
  //console.log("Quote for transfer: ", quote);
/*
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
  await routes.checkAndCompleteTransfer(bestRoute, receipt, dstSigner.signer);*/
})();