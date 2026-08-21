// GENERATED FILE — DO NOT EDIT.
//
// Regenerate with `pnpm generate:paths` (scripts/fetch-supported-paths.ts).
// Refreshed daily by .github/workflows/update-supported-paths.yaml.
//
// Every entry was live on-chain at the time below. This table is the *candidate*
// set only: the SDK re-checks each path against the Portal before offering it, so
// a stale table can under-report but can never advertise a path that would revert.
import { Chain } from "@wormhole-foundation/sdk-connect";

export interface GeneratedBridgePath {
  sourceChain: Chain;
  /** EVM: lowercase 0x address. Solana: base58 mint. */
  sourceToken: string;
  destinationChain: Chain;
  /** EVM: lowercase 0x address. Solana: base58 mint. */
  destinationToken: string;
}

export interface GeneratedTokenInfo {
  symbol: string;
  decimals: number;
}

export const GENERATED_AT = "2026-08-19T12:11:44.680Z";

export const SUPPORTED_PATHS: Record<string, GeneratedBridgePath[]> = {
  "Mainnet": [
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Base",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Base",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Ethereum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Ethereum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Ethereum",
      "destinationToken": "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Base",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Base",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Ethereum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Ethereum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf"
    },
    {
      "sourceChain": "Arbitrum",
      "sourceToken": "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56",
      "destinationChain": "Ethereum",
      "destinationToken": "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Ethereum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Ethereum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Ethereum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Ethereum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX"
    },
    {
      "sourceChain": "Base",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf"
    },
    {
      "sourceChain": "Bsc",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Ethereum",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Bsc",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Linea",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Bsc",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Monad",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Arbitrum",
      "destinationToken": "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Base",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Base",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "HyperEVM",
      "destinationToken": "0xb50a96253abdf803d85efcdce07ad8becbc52bd5"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Moca",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Arbitrum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Base",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Base",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Moca",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Moca",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Monad",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "xoUSD7HdezER6vVPbYETEpPR3G7CsCgzWioiDezxDsg"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "xoUSDGZKvRqNK11R4KwYofahwCybp9VXTjuvRDSjFsV"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56",
      "destinationChain": "Arbitrum",
      "destinationToken": "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Bsc",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Linea",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Monad",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0xdb1c440386b864181c77c02a51b7f4f6dd840df4",
      "destinationChain": "Moca",
      "destinationToken": "0x911c64b221d3509f4fe27a352d12d8a0615d0674"
    },
    {
      "sourceChain": "Ethereum",
      "sourceToken": "0xdb1c440386b864181c77c02a51b7f4f6dd840df4",
      "destinationChain": "Solana",
      "destinationToken": "xoUSDq85Rjsb6SbUwJyreFgeWQvxdkT7R3c3g7s6p5Y"
    },
    {
      "sourceChain": "HyperEVM",
      "sourceToken": "0xb50a96253abdf803d85efcdce07ad8becbc52bd5",
      "destinationChain": "Ethereum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Linea",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Bsc",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Linea",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Ethereum",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Linea",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Monad",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Moca",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Ethereum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Moca",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Ethereum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Moca",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Ethereum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Moca",
      "sourceToken": "0x911c64b221d3509f4fe27a352d12d8a0615d0674",
      "destinationChain": "Ethereum",
      "destinationToken": "0xdb1c440386b864181c77c02a51b7f4f6dd840df4"
    },
    {
      "sourceChain": "Monad",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Ethereum",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Monad",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Bsc",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Monad",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Ethereum",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Monad",
      "sourceToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da",
      "destinationChain": "Linea",
      "destinationToken": "0xaca92e438df0b2401ff60da7e4337b687a2435da"
    },
    {
      "sourceChain": "Solana",
      "sourceToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp",
      "destinationChain": "Ethereum",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Solana",
      "sourceToken": "xoUSDq85Rjsb6SbUwJyreFgeWQvxdkT7R3c3g7s6p5Y",
      "destinationChain": "Ethereum",
      "destinationToken": "0xdb1c440386b864181c77c02a51b7f4f6dd840df4"
    }
  ],
  "Testnet": [
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Sepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Sepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "ArbitrumSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Sepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Sepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "BaseSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Sepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Sepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "OptimismSepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x437cc33344a0b27a429f795ff6b469c72698b291",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "ArbitrumSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "BaseSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "OptimismSepolia",
      "destinationToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp"
    },
    {
      "sourceChain": "Sepolia",
      "sourceToken": "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b",
      "destinationChain": "Solana",
      "destinationToken": "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"
    },
    {
      "sourceChain": "Solana",
      "sourceToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    },
    {
      "sourceChain": "Solana",
      "sourceToken": "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp",
      "destinationChain": "Sepolia",
      "destinationToken": "0x437cc33344a0b27a429f795ff6b469c72698b291"
    }
  ]
};

export const TOKEN_INFO: Record<string, Partial<Record<Chain, Record<string, GeneratedTokenInfo>>>> = {
  "Mainnet": {
    "Ethereum": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      },
      "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56": {
        "symbol": "USDZ",
        "decimals": 6
      },
      "0xaca92e438df0b2401ff60da7e4337b687a2435da": {
        "symbol": "mUSD",
        "decimals": 6
      },
      "0xdb1c440386b864181c77c02a51b7f4f6dd840df4": {
        "symbol": "MM",
        "decimals": 6
      }
    },
    "Arbitrum": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      },
      "0xa4b6df229aee22b4252dc578feb2720e8a2c4a56": {
        "symbol": "USDZ",
        "decimals": 6
      }
    },
    "Solana": {
      "mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo": {
        "symbol": "",
        "decimals": 6
      },
      "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp": {
        "symbol": "",
        "decimals": 6
      },
      "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6": {
        "symbol": "",
        "decimals": 6
      },
      "usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX": {
        "symbol": "",
        "decimals": 6
      },
      "usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf": {
        "symbol": "",
        "decimals": 6
      },
      "xoUSD7HdezER6vVPbYETEpPR3G7CsCgzWioiDezxDsg": {
        "symbol": "",
        "decimals": 6
      },
      "xoUSDGZKvRqNK11R4KwYofahwCybp9VXTjuvRDSjFsV": {
        "symbol": "",
        "decimals": 6
      },
      "xoUSDq85Rjsb6SbUwJyreFgeWQvxdkT7R3c3g7s6p5Y": {
        "symbol": "",
        "decimals": 6
      }
    },
    "Base": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      }
    },
    "Moca": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      },
      "0x911c64b221d3509f4fe27a352d12d8a0615d0674": {
        "symbol": "USD8",
        "decimals": 6
      }
    },
    "Monad": {
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      },
      "0xaca92e438df0b2401ff60da7e4337b687a2435da": {
        "symbol": "mUSD",
        "decimals": 6
      }
    },
    "HyperEVM": {
      "0xb50a96253abdf803d85efcdce07ad8becbc52bd5": {
        "symbol": "USDHL",
        "decimals": 6
      }
    },
    "Bsc": {
      "0xaca92e438df0b2401ff60da7e4337b687a2435da": {
        "symbol": "mUSD",
        "decimals": 6
      }
    },
    "Linea": {
      "0xaca92e438df0b2401ff60da7e4337b687a2435da": {
        "symbol": "mUSD",
        "decimals": 6
      }
    }
  },
  "Testnet": {
    "Sepolia": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      }
    },
    "ArbitrumSepolia": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      }
    },
    "OptimismSepolia": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      }
    },
    "BaseSepolia": {
      "0x437cc33344a0b27a429f795ff6b469c72698b291": {
        "symbol": "wM",
        "decimals": 6
      },
      "0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b": {
        "symbol": "M",
        "decimals": 6
      }
    },
    "Solana": {
      "mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp": {
        "symbol": "",
        "decimals": 6
      },
      "mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6": {
        "symbol": "",
        "decimals": 6
      }
    }
  }
};
