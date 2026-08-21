/**
 * Checks that what the SDK offers equals what the Portal accepts.
 *
 * For every (source chain, source token, destination chain) the SDK can produce,
 * compares `EvmRouter.getSupportedDestinationTokens` against a direct
 * `supportedBridgingPath` read. Any difference is a bug: extra entries would be
 * offered to users and revert, missing entries are routes silently withheld.
 *
 * Run:  pnpm verify:paths
 */
import { Chain, chainToPlatform, Network } from "@wormhole-foundation/sdk-connect";
import { Contract, JsonRpcProvider } from "ethers";
import { PublicKey } from "@solana/web3.js";
// Registers the platform address types that `toNative` needs.
import "@wormhole-foundation/sdk-evm";
import "@wormhole-foundation/sdk-solana";
import { EvmRouter } from "../src/evm";
import { getM0ChainId } from "../src/chainIds";
import { knownChains, knownSourceTokens, knownTokensOn } from "../src/paths";
import { GENERATED_AT } from "../src/generated/supportedPaths";

const PORTAL = "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd";
const PORTAL_ABI = ["function supportedBridgingPath(address,uint32,bytes32) view returns (bool)"];

const PUBLIC_RPC: Partial<Record<Chain, string>> = {
  Ethereum: "https://ethereum-rpc.publicnode.com",
  Arbitrum: "https://arb1.arbitrum.io/rpc",
  Base: "https://base-rpc.publicnode.com",
  Bsc: "https://bsc-rpc.publicnode.com",
  Linea: "https://linea-rpc.publicnode.com",
  HyperEVM: "https://rpc.hyperliquid.xyz/evm",
  Monad: "https://rpc.monad.xyz",
  Plasma: "https://rpc.plasma.to",
  Moca: "https://rpc.mocachain.org",
  Sepolia: "https://ethereum-sepolia-rpc.publicnode.com",
  ArbitrumSepolia: "https://sepolia-rollup.arbitrum.io/rpc",
  BaseSepolia: "https://base-sepolia-rpc.publicnode.com",
  OptimismSepolia: "https://optimism-sepolia-rpc.publicnode.com",
};

function rpcUrl(chain: Chain): string | undefined {
  const key = `${chain.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase()}_RPC_URL`;
  return process.env[key] || PUBLIC_RPC[chain];
}

function toBytes32(chain: Chain, token: string): string {
  if (chainToPlatform(chain) === "Solana") {
    return `0x${Buffer.from(new PublicKey(token).toBytes()).toString("hex")}`;
  }
  return `0x${token.replace(/^0x/, "").toLowerCase().padStart(64, "0")}`;
}

async function verifyNetwork(network: Network): Promise<number> {
  console.log(`\n${network} (table generated ${GENERATED_AT})`);
  let pairs = 0;
  let offered = 0;
  let mismatches = 0;

  for (const chain of knownChains(network).filter((c) => chainToPlatform(c) === "Evm")) {
    const url = rpcUrl(chain);
    if (!url) {
      console.log(`  ${chain}: no RPC — skipped`);
      continue;
    }

    const provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
    const router = new EvmRouter(provider, chain, network as Exclude<Network, "Devnet">);
    const portal = new Contract(PORTAL, PORTAL_ABI, provider);

    for (const sourceToken of knownSourceTokens(network, chain)) {
      for (const toChain of knownChains(network)) {
        if (toChain === chain) continue;

        const sdk = (await router.getSupportedDestinationTokens(sourceToken, toChain))
          .map((t) => t.address.toString().toLowerCase())
          .sort();

        const onChain: string[] = [];
        for (const candidate of knownTokensOn(network, toChain)) {
          const supported: boolean = await portal.supportedBridgingPath(
            sourceToken,
            getM0ChainId(toChain, network),
            toBytes32(toChain, candidate),
          );
          if (supported) onChain.push(candidate.toLowerCase());
        }
        onChain.sort();

        pairs++;
        offered += sdk.length;
        if (JSON.stringify(sdk) !== JSON.stringify(onChain)) {
          mismatches++;
          console.log(`  MISMATCH ${chain}:${sourceToken} -> ${toChain}`);
          console.log(`     sdk      ${JSON.stringify(sdk)}`);
          console.log(`     on-chain ${JSON.stringify(onChain)}`);
        }
      }
    }
    console.log(`  ${chain}: ok`);
  }

  console.log(`  pairs checked ${pairs}, destination tokens offered ${offered}, mismatches ${mismatches}`);
  return mismatches;
}

async function main() {
  let mismatches = 0;
  for (const network of ["Mainnet", "Testnet"] as Network[]) {
    mismatches += await verifyNetwork(network);
  }
  if (mismatches > 0) {
    console.error(`\n${mismatches} mismatch(es) between the SDK and on-chain state`);
    process.exit(1);
  }
  console.log("\nSDK output matches on-chain state exactly.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
