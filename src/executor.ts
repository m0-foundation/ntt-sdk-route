import { Chain, Network } from "@wormhole-foundation/sdk-connect";
import { NttExecutorRoute, NttRoute } from "@wormhole-foundation/sdk-route-ntt";
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
            token: "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b",
            manager: "0xeAae496BcDa93cCCd3fD6ff6096347979e87B153",
            transceiver: [
              {
                type: "wormhole" as NttRoute.TransceiverType,
                address: "0xeAae496BcDa93cCCd3fD6ff6096347979e87B153",
              },
            ],
          })),
        ],
      },
    },
    referrerFee: {
      feeDbps: 0n,
      perTokenOverrides: {
        Solana: {
          ["mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH"]: {
            msgValue: 15_000_000n,
          },
        },
      },
    },
  };
}
