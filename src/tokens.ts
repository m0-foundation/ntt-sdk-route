import { Chain, Network, TokenId, toNative } from "@wormhole-foundation/sdk-connect";

/**
 * Tokens the Portal can bridge, per chain.
 *
 * MAINTAINED BY HAND. Add an entry whenever an M extension is deployed or a new
 * chain is onboarded — nothing detects a missing one. An absent token is not an
 * error; the route simply never appears.
 *
 * This is a candidate list only. `EvmRouter` re-checks each entry against
 * `Portal.supportedBridgingPath` before offering it, so a token listed here that
 * has no live path is pruned rather than shown. Listing a token is therefore safe;
 * omitting one is what costs you a route.
 *
 * EVM addresses are lowercase; Solana entries are base58 mints. M and wM share
 * one address across EVM chains (deterministic deploys) but extensions do not —
 * they are chain-local brands, so each chain lists its own.
 */
export const TOKENS: Record<string, Partial<Record<Chain, string[]>>> = {
  Mainnet: {
    Arbitrum: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
      "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56", // USDZ
    ],
    Base: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
    ],
    Bsc: [
      "0xaca92e438df0b2401ff60da7e4337b687a2435da", // mUSD
    ],
    Ethereum: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
      "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56", // USDZ
      "0xaca92e438df0b2401ff60da7e4337b687a2435da", // mUSD
      "0xdb1c440386b864181c77c02a51b7f4f6dd840df4", // MM
    ],
    HyperEVM: [
      "0xb50a96253abdf803d85efcdce07ad8becbc52bd5", // USDHL
    ],
    Linea: [
      "0xaca92e438df0b2401ff60da7e4337b687a2435da", // mUSD
    ],
    Moca: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
      "0x911c64b221d3509f4fe27a352d12d8a0615d0674", // USD8
    ],
    Monad: [
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
      "0xaca92e438df0b2401ff60da7e4337b687a2435da", // mUSD
    ],
    Solana: [
      "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp", // wM (M0 extension)
      "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6", // M0 extension
      "mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo", // M0 extension
      "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX", // M0 extension
      "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf", // M0 extension
      "xoUSD7HdezER6vVPbYETEpPR3G7CsCgzWioiDezxDsg", // M0 extension
      "xoUSDGZKvRqNK11R4KwYofahwCybp9VXTjuvRDSjFsV", // M0 extension
      "xoUSDq85Rjsb6SbUwJyreFgeWQvxdkT7R3c3g7s6p5Y", // M0 extension
    ],
  },
  Testnet: {
    ArbitrumSepolia: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
    ],
    BaseSepolia: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
    ],
    OptimismSepolia: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
    ],
    Sepolia: [
      "0x437cc33344a0b27a429f795ff6b469c72698b291", // wM
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b", // M
    ],
    Solana: [
      "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp", // wM (M0 extension)
      "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6", // M0 extension
    ],
  },
};

/**
 * Chains this route can bridge between. Must stay in step with `TOKENS` above —
 * a chain listed here with no tokens offers nothing, and a chain with tokens but
 * missing here is unreachable.
 */
export const SUPPORTED_CHAINS: Record<string, Chain[]> = {
  Mainnet: ["Arbitrum", "Base", "Bsc", "Ethereum", "HyperEVM", "Linea", "Moca", "Monad", "Solana"],
  Testnet: ["ArbitrumSepolia", "BaseSepolia", "OptimismSepolia", "Sepolia", "Solana"],
};

export function knownChains(network: Network): Chain[] {
  return SUPPORTED_CHAINS[network] ?? [];
}

/** Candidate source tokens on `chain`; narrowed against the Portal before use. */
export function knownSourceTokens(network: Network, chain: Chain): string[] {
  return TOKENS[network]?.[chain] ?? [];
}

/**
 * Candidate destination tokens on `chain`. Identical to the source list — without
 * a path table there is no way to tell which pairings exist, so every token on the
 * destination chain is a candidate and the on-chain check decides.
 */
export function knownTokensOn(network: Network, chain: Chain): string[] {
  return TOKENS[network]?.[chain] ?? [];
}

/** Both endpoints supported. Whether a path exists between them is decided on-chain. */
export function hasAnyPath(network: Network, fromChain: Chain, toChain: Chain): boolean {
  const chains = knownChains(network);
  return chains.includes(fromChain) && chains.includes(toChain);
}

export function toTokenIds(chain: Chain, tokens: string[]): TokenId[] {
  return tokens.map((token) => ({ chain, address: toNative(chain, token) }));
}
