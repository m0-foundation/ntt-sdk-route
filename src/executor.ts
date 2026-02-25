import { Chain, Network } from "@wormhole-foundation/sdk-connect";
import { NttExecutorRoute, NttRoute } from "@wormhole-foundation/sdk-route-ntt";
import { M0AutomaticRoute } from "./m0AutomaticRoute";
import { PublicKey } from "@solana/web3.js";

export function getExecutorConfig(
  network: Network = "Mainnet",
): NttExecutorRoute.Config {
  const svmChains: Chain[] = ["Solana"];
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
            token: "mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH",
            manager: "mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY",
            transceiver: [
              {
                type: "wormhole" as NttRoute.TransceiverType,
                address: PublicKey.default.toBase58(),
              },
            ],
            quoter: "Nqd6XqA8LbsCuG8MLWWuP865NV6jR1MbXeKxD4HLKDJ",
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
          [PublicKey.default.toBase58()]: {
            msgValue: 15_000_000n,
          },
        },
      },
    },
  };
}
