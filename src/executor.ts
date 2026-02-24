import { chain, Chain, Network } from "@wormhole-foundation/sdk-connect";
import { NttExecutorRoute, NttRoute } from "@wormhole-foundation/sdk-route-ntt";
import { SolanaRoutes } from "./svm-old";
import { M0AutomaticRoute } from "./m0AutomaticRoute";

export function getExecutorConfig(
  network: Network = "Mainnet",
): NttExecutorRoute.Config {
  // core programs the same for Fogo and Solana
  const svmContracts = SolanaRoutes.getSolanaContracts(network, "Solana");

  const svmChains: Chain[] = ["Solana", "Fogo"];
  const evmChains: Chain[] =
    network === "Mainnet"
      ? ["Ethereum", "Optimism", "Arbitrum", "Base"]
      : ["Sepolia", "ArbitrumSepolia", "OptimismSepolia", "BaseSepolia"];

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
          [svmContracts.token]: {
            msgValue: 15_000_000n,
          },
        },
        Fogo: {
          [svmContracts.token]: {
            msgValue: 15_000_000n,
          },
        },
      },
    },
  };
}
