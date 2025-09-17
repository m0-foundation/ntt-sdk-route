import { Chain, Network } from "@wormhole-foundation/sdk-connect";
import {
  nttExecutorRoute,
  NttExecutorRoute,
  NttRoute,
} from "@wormhole-foundation/sdk-route-ntt";
import { SolanaRoutes } from "./svm";
import { M0AutomaticRoute } from "./m0AutomaticRoute";

export function getExectorRoute(network: Network = "Mainnet") {
  return nttExecutorRoute(getExecutorConfig(network));
}

function getExecutorConfig(
  network: Network = "Mainnet"
): NttExecutorRoute.Config {
  const svmContracts = SolanaRoutes.getSolanaContracts(network);
  const svmChains: Chain[] = ["Solana", "Fogo"];
  const evmChains: Chain[] = ["Ethereum", "Sepolia"];

  return {
    ntt: {
      tokens: {
        M0: [
          ...svmChains.map((chain) => ({
            chain,
            token: svmContracts.token,
            manager: svmContracts.manager,
            transceiver: [
              {
                type: "wormhole" as NttRoute.TransceiverType,
                address: svmContracts.transceiver.wormhole,
              },
            ],
            quoter: svmContracts.quoter,
          })),
          ...evmChains.map((chain) => ({
            chain,
            token: M0AutomaticRoute.EVM_CONTRACTS.token,
            manager: M0AutomaticRoute.EVM_CONTRACTS.manager,
            transceiver: [
              {
                type: "wormhole" as NttRoute.TransceiverType,
                address: M0AutomaticRoute.EVM_CONTRACTS.transceiver.wormhole,
              },
            ],
            quoter: M0AutomaticRoute.EVM_CONTRACTS.quoter,
          })),
        ],
      },
    },
    referrerFee: {
      feeDbps: 0n,
      perTokenOverrides: {
        // SVM chains require extra compute when receiving messages
        // so we need to override the gas cost
        Solana: {
          mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6: {
            msgValue: 20_000_000n,
          },
          mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo: {
            msgValue: 20_000_000n,
          },
        },
        Fogo: {
          mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6: {
            msgValue: 20_000_000n,
          },
          mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo: {
            msgValue: 20_000_000n,
          },
        },
      },
    },
  };
}
