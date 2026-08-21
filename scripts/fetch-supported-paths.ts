/**
 * Regenerates `src/generated/supportedPaths.ts` from live chain state.
 *
 * Source of truth is the Portal itself:
 *   - EVM    -> `SupportedBridgingPathSet(address,uint32,bytes32,bool)` logs, folded
 *              in block order to the current value of each (src, dstChain, dstToken).
 *   - Solana -> the Portal program's `ChainBridgePaths` accounts.
 *
 * Run:  pnpm generate:paths
 * Never hand-edit the output.
 */
import { Chain, Network, chainToPlatform, chains } from "@wormhole-foundation/sdk-connect";
import { Connection, PublicKey } from "@solana/web3.js";
import { Contract, JsonRpcProvider, id as keccakId } from "ethers";
import { writeFileSync } from "fs";
import { join } from "path";
import { getM0ChainId } from "../src/chainIds";

const PORTAL_EVM = "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd";
const PORTAL_SVM = new PublicKey("MzBrgc8yXBj4P16GTkcSyDZkEQZB9qDqf3fh9bByJce");
const CHAIN_BRIDGE_PATHS_DISCRIMINATOR = Buffer.from([89, 30, 178, 53, 154, 232, 75, 140]);
const PATH_SET_TOPIC = keccakId("SupportedBridgingPathSet(address,uint32,bytes32,bool)");

/** Guardrails for chains whose RPC caps the getLogs block range. */
const MAX_LOG_REQUESTS = Number(process.env.MAX_LOG_REQUESTS ?? 400);
const LOG_CONCURRENCY = 8;

const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
const MULTICALL3_ABI = [
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) view returns ((bool success, bytes returnData)[])",
];
const PORTAL_ABI = ["function supportedBridgingPath(address,uint32,bytes32) view returns (bool)"];

/** Present on every chain the Portal is deployed to; used for the probe fallback. */
const PROBE_BATCH = 400;

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

/**
 * Chains the generator will scan. A chain only produces routes if it is also a
 * Wormhole `Chain` — the route travels over the Wormhole adapter, so chains
 * outside Wormhole's registry (Soneium, Citrea, Fluent, RISE, MANTRA, Seismic,
 * Nexus, ...) can never be an endpoint here. Destinations that resolve to one of
 * those are dropped and reported, never silently skipped.
 */
const SCAN: Record<Network, Chain[]> = {
  Mainnet: ["Ethereum", "Arbitrum", "Base", "Moca", "Bsc", "Linea", "HyperEVM", "Monad", "Plasma", "Solana"],
  Testnet: ["Sepolia", "ArbitrumSepolia", "BaseSepolia", "OptimismSepolia", "Solana"],
  Devnet: [],
};

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

const SOLANA_RPC: Record<string, string> = {
  Mainnet: process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  Testnet: process.env.SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
};

/** `ETHEREUM_RPC_URL`, `MOCA_RPC_URL`, `ARBITRUM_SEPOLIA_RPC_URL`, ... */
function rpcEnvKey(chain: Chain): string {
  return `${chain.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase()}_RPC_URL`;
}

function rpcUrl(chain: Chain): string | undefined {
  return process.env[rpcEnvKey(chain)] || PUBLIC_RPC[chain];
}

interface BridgePath {
  sourceChain: Chain;
  sourceToken: string;
  destinationChain: Chain;
  destinationToken: string;
}

interface TokenInfo {
  symbol: string;
  decimals: number;
}

const warnings: string[] = [];
function warn(message: string) {
  warnings.push(message);
  console.warn(`  ! ${message}`);
}

/** M0 chain id -> Wormhole Chain, inverted from `getM0ChainId` over the scan set. */
function m0ChainIdIndex(network: Network): Map<number, Chain> {
  const index = new Map<number, Chain>();
  for (const chain of chains) {
    try {
      index.set(getM0ChainId(chain, network), chain);
    } catch {
      // chain has no M0 id; not addressable by the Portal
    }
  }
  return index;
}

/**
 * Earliest block with code at `address`, by binary search. Returns 0 when the
 * node has no archive state — scanning from genesis is slower but never misses
 * an event, which matters more than the extra requests.
 */
async function deployBlock(provider: JsonRpcProvider, address: string, head: number): Promise<number> {
  try {
    if ((await provider.getCode(address, 0)) !== "0x") return 0;
  } catch {
    return 0; // no archive state
  }

  let lo = 0;
  let hi = head;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let code: string;
    try {
      code = await provider.getCode(address, mid);
    } catch {
      return 0; // partial archive; fall back to a full scan
    }
    if (code === "0x") lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

type PathLog = { blockNumber: number; index: number; topics: readonly string[]; data: string };

async function getLogsRange(provider: JsonRpcProvider, fromBlock: number, toBlock: number): Promise<PathLog[]> {
  const logs = await provider.getLogs({ address: PORTAL_EVM, topics: [PATH_SET_TOPIC], fromBlock, toBlock });
  return logs.map((l) => ({ blockNumber: l.blockNumber, index: l.index, topics: l.topics, data: l.data }));
}

/**
 * Largest block span this RPC will accept for getLogs. Probed once per chain —
 * providers differ by orders of magnitude (Alchemy serves the full chain in one
 * call, Moca caps at 10k).
 */
async function maxLogSpan(provider: JsonRpcProvider, head: number): Promise<number> {
  for (const span of [head + 1, 1_000_000, 100_000, 50_000, 10_000, 2_000]) {
    if (span > head + 1) continue;
    try {
      await getLogsRange(provider, Math.max(head - span + 1, 0), head);
      return span;
    } catch {
      // try a smaller span
    }
  }
  return 1_000;
}

/** getLogs over [fromBlock, toBlock] in spans the provider accepts, run in parallel batches. */
async function fetchPathLogs(provider: JsonRpcProvider, fromBlock: number, toBlock: number): Promise<PathLog[]> {
  const span = await maxLogSpan(provider, toBlock);

  const ranges: Array<[number, number]> = [];
  for (let cursor = fromBlock; cursor <= toBlock; cursor += span) {
    ranges.push([cursor, Math.min(cursor + span - 1, toBlock)]);
  }
  if (ranges.length > MAX_LOG_REQUESTS) {
    throw new Error(
      `would need ${ranges.length} getLogs calls at ${span} blocks/call (limit ${MAX_LOG_REQUESTS}) — ` +
        `use an archive RPC with a larger range limit`,
    );
  }

  const out: PathLog[] = [];
  for (let i = 0; i < ranges.length; i += LOG_CONCURRENCY) {
    const batch = ranges.slice(i, i + LOG_CONCURRENCY);
    const results = await Promise.all(batch.map(([lo, hi]) => getLogsRange(provider, lo, hi)));
    for (const r of results) out.push(...r);
  }
  return out;
}

/** bytes32 form of a destination token, matching the Portal's encoding. */
function toBytes32(chain: Chain, token: string): string {
  if (chainToPlatform(chain) === "Solana") {
    return `0x${Buffer.from(new PublicKey(token).toBytes()).toString("hex")}`;
  }
  return `0x${token.replace(/^0x/, "").toLowerCase().padStart(64, "0")}`;
}

/**
 * Fallback for chains whose RPC will not serve a full log history. Probes
 * `supportedBridgingPath` for every (sourceToken, destinationChain, destinationToken)
 * built from tokens already discovered elsewhere, batched through Multicall3.
 *
 * This can only see tokens that appear somewhere in the log-derived set, so it is
 * strictly weaker than enumeration — it is a fallback, not an equal.
 */
async function probeEvmChain(
  network: Network,
  chain: Chain,
  tokensByChain: Map<Chain, Set<string>>,
  scanSet: Chain[],
): Promise<BridgePath[]> {
  const url = rpcUrl(chain);
  if (!url) return [];

  const provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
  const multicall = new Contract(MULTICALL3, MULTICALL3_ABI, provider);
  const portal = new Contract(PORTAL_EVM, PORTAL_ABI, provider);

  if ((await provider.getCode(MULTICALL3)) === "0x") {
    warn(`${chain}: Multicall3 not deployed — cannot probe`);
    return [];
  }

  const sources = [...(tokensByChain.get(chain) ?? new Set<string>())];
  if (sources.length === 0) {
    warn(`${chain}: no candidate tokens discovered from other chains — no paths recorded`);
    return [];
  }

  const candidates: BridgePath[] = [];
  for (const sourceToken of sources) {
    for (const destinationChain of scanSet) {
      if (destinationChain === chain) continue;
      for (const destinationToken of tokensByChain.get(destinationChain) ?? []) {
        candidates.push({ sourceChain: chain, sourceToken, destinationChain, destinationToken });
      }
    }
  }

  const live: BridgePath[] = [];
  for (let i = 0; i < candidates.length; i += PROBE_BATCH) {
    const batch = candidates.slice(i, i + PROBE_BATCH);
    const calls = batch.map((c) => ({
      target: PORTAL_EVM,
      allowFailure: true,
      callData: portal.interface.encodeFunctionData("supportedBridgingPath", [
        c.sourceToken,
        getM0ChainId(c.destinationChain, network),
        toBytes32(c.destinationChain, c.destinationToken),
      ]),
    }));
    const results: Array<{ success: boolean; returnData: string }> = await multicall.aggregate3(calls);
    results.forEach((r, j) => {
      if (r.success && BigInt(r.returnData) === 1n) live.push(batch[j]!);
    });
  }

  console.log(`  ${chain}: probed ${candidates.length} candidates, ${live.length} live paths (log fallback)`);
  return live;
}

async function scanEvmChain(network: Network, chain: Chain, index: Map<number, Chain>): Promise<BridgePath[]> {
  const url = rpcUrl(chain);
  if (!url) {
    warn(`${chain}: no RPC (set ${rpcEnvKey(chain)}) — skipped`);
    return [];
  }

  const provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
  if ((await provider.getCode(PORTAL_EVM)) === "0x") {
    console.log(`  ${chain}: Portal not deployed — skipped`);
    return [];
  }

  const head = await provider.getBlockNumber();
  const start = await deployBlock(provider, PORTAL_EVM, head);
  const logs = await fetchPathLogs(provider, start, head);

  // Fold in block order; the last write for a key is its current value.
  const state = new Map<string, { supported: boolean; path: Omit<BridgePath, "destinationChain"> & { destinationChainId: number } }>();
  for (const log of logs.sort((a, b) => a.blockNumber - b.blockNumber || a.index - b.index)) {
    const sourceToken = `0x${log.topics[1]!.slice(26)}`.toLowerCase();
    const destinationChainId = Number(BigInt(log.topics[2]!));
    const destinationTokenRaw = log.topics[3]!;
    state.set(`${sourceToken}:${destinationChainId}:${destinationTokenRaw}`, {
      supported: BigInt(log.data) === 1n,
      path: { sourceChain: chain, sourceToken, destinationChainId, destinationToken: destinationTokenRaw },
    });
  }

  const paths: BridgePath[] = [];
  const dropped = new Set<number>();
  for (const { supported, path } of state.values()) {
    if (!supported) continue;
    const destinationChain = index.get(path.destinationChainId);
    if (!destinationChain) {
      dropped.add(path.destinationChainId);
      continue;
    }
    paths.push({
      sourceChain: chain,
      sourceToken: path.sourceToken,
      destinationChain,
      destinationToken: decodeDestinationToken(destinationChain, path.destinationToken),
    });
  }

  console.log(`  ${chain}: ${logs.length} events, ${paths.length} live paths (from block ${start})`);
  for (const id of [...dropped].sort((a, b) => a - b)) {
    warn(`${chain}: live paths to M0 chain id ${id} dropped — no Wormhole chain in this SDK version`);
  }
  return paths;
}

function decodeDestinationToken(destinationChain: Chain, raw: string): string {
  if (chainToPlatform(destinationChain) === "Solana") {
    return new PublicKey(Buffer.from(raw.slice(2), "hex")).toBase58();
  }
  return `0x${raw.slice(26)}`.toLowerCase();
}

async function scanSolana(network: Network, index: Map<number, Chain>): Promise<BridgePath[]> {
  const connection = new Connection(SOLANA_RPC[network]!, "confirmed");
  const accounts = await connection.getProgramAccounts(PORTAL_SVM, {
    filters: [{ memcmp: { offset: 0, bytes: bs58(CHAIN_BRIDGE_PATHS_DISCRIMINATOR) } }],
  });

  const paths: BridgePath[] = [];
  const dropped = new Set<number>();
  for (const { account } of accounts) {
    const data = account.data;
    let offset = 8 + 1; // discriminator + bump
    const destinationChainId = data.readUInt32LE(offset);
    offset += 4;
    const count = data.readUInt32LE(offset);
    offset += 4;

    const destinationChain = index.get(destinationChainId);
    for (let i = 0; i < count; i++) {
      const sourceMint = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
      offset += 32;
      const destinationToken = data.subarray(offset, offset + 32);
      offset += 32;
      if (!destinationChain) {
        dropped.add(destinationChainId);
        continue;
      }
      paths.push({
        sourceChain: "Solana",
        sourceToken: sourceMint,
        destinationChain,
        destinationToken: decodeDestinationToken(destinationChain, `0x${destinationToken.toString("hex")}`),
      });
    }
  }

  console.log(`  Solana: ${accounts.length} ChainBridgePaths accounts, ${paths.length} live paths`);
  for (const id of [...dropped].sort((a, b) => a - b)) {
    warn(`Solana: live paths to M0 chain id ${id} dropped — no Wormhole chain in this SDK version`);
  }
  return paths;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function bs58(buf: Buffer): string {
  let n = BigInt(`0x${buf.toString("hex")}`);
  let s = "";
  while (n > 0n) {
    s = B58[Number(n % 58n)] + s;
    n /= 58n;
  }
  for (const b of buf) {
    if (b !== 0) break;
    s = `1${s}`;
  }
  return s;
}

/** symbol/decimals for every token that appears on either end of a live path. */
async function fetchTokenInfo(network: Network, paths: BridgePath[]) {
  const byChain = new Map<Chain, Set<string>>();
  for (const p of paths) {
    (byChain.get(p.sourceChain) ?? byChain.set(p.sourceChain, new Set()).get(p.sourceChain)!).add(p.sourceToken);
    (byChain.get(p.destinationChain) ?? byChain.set(p.destinationChain, new Set()).get(p.destinationChain)!).add(p.destinationToken);
  }

  const info: Partial<Record<Chain, Record<string, TokenInfo>>> = {};
  for (const [chain, tokens] of byChain) {
    const entries: Record<string, TokenInfo> = {};
    if (chainToPlatform(chain) === "Solana") {
      const connection = new Connection(SOLANA_RPC[network]!, "confirmed");
      for (const mint of tokens) {
        try {
          const parsed = await connection.getParsedAccountInfo(new PublicKey(mint));
          const decimals = (parsed.value?.data as any)?.parsed?.info?.decimals;
          entries[mint] = { symbol: "", decimals: typeof decimals === "number" ? decimals : 6 };
        } catch {
          warn(`Solana: could not read mint ${mint}`);
        }
      }
    } else {
      const url = rpcUrl(chain);
      if (!url) continue;
      const provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
      for (const address of tokens) {
        try {
          const erc20 = new Contract(address, ERC20_ABI, provider);
          const [symbol, decimals] = await Promise.all([erc20.symbol(), erc20.decimals()]);
          entries[address] = { symbol: String(symbol), decimals: Number(decimals) };
        } catch {
          warn(`${chain}: could not read symbol/decimals for ${address}`);
        }
      }
    }
    info[chain] = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
  }
  return info;
}

function sortPaths(paths: BridgePath[]): BridgePath[] {
  return [...paths].sort(
    (a, b) =>
      a.sourceChain.localeCompare(b.sourceChain) ||
      a.sourceToken.localeCompare(b.sourceToken) ||
      a.destinationChain.localeCompare(b.destinationChain) ||
      a.destinationToken.localeCompare(b.destinationToken),
  );
}

function render(
  pathsByNetwork: Record<string, BridgePath[]>,
  infoByNetwork: Record<string, Partial<Record<Chain, Record<string, TokenInfo>>>>,
  generatedAt: string,
): string {
  return `// GENERATED FILE — DO NOT EDIT.
//
// Regenerate with \`pnpm generate:paths\` (scripts/fetch-supported-paths.ts).
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

export const GENERATED_AT = ${JSON.stringify(generatedAt)};

export const SUPPORTED_PATHS: Record<string, GeneratedBridgePath[]> = ${JSON.stringify(pathsByNetwork, null, 2)};

export const TOKEN_INFO: Record<string, Partial<Record<Chain, Record<string, GeneratedTokenInfo>>>> = ${JSON.stringify(infoByNetwork, null, 2)};
`;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const pathsByNetwork: Record<string, BridgePath[]> = {};
  const infoByNetwork: Record<string, Partial<Record<Chain, Record<string, TokenInfo>>>> = {};

  for (const network of ["Mainnet", "Testnet"] as Network[]) {
    console.log(`\n${network}`);
    const index = m0ChainIdIndex(network);
    const collected: BridgePath[] = [];

    const needsProbe: Chain[] = [];
    for (const chain of SCAN[network]) {
      try {
        collected.push(
          ...(chainToPlatform(chain) === "Solana"
            ? await scanSolana(network, index)
            : await scanEvmChain(network, chain, index)),
        );
      } catch (e) {
        warn(`${chain}: log enumeration unavailable (${(e as Error).message}) — falling back to probing`);
        needsProbe.push(chain);
      }
    }

    // Second pass: chains whose RPC would not serve a full log history. Their
    // candidate tokens come from what the first pass already saw on that chain.
    if (needsProbe.length) {
      const tokensByChain = new Map<Chain, Set<string>>();
      const note = (chain: Chain, token: string) =>
        (tokensByChain.get(chain) ?? tokensByChain.set(chain, new Set()).get(chain)!).add(token);
      for (const p of collected) {
        note(p.sourceChain, p.sourceToken);
        note(p.destinationChain, p.destinationToken);
      }
      for (const chain of needsProbe) {
        try {
          collected.push(...(await probeEvmChain(network, chain, tokensByChain, SCAN[network])));
        } catch (e) {
          warn(`${chain}: probe failed — ${(e as Error).message}`);
        }
      }
    }

    // A path is only usable if both endpoints are chains this route supports.
    const inScope = new Set(SCAN[network]);
    const usable = collected.filter((p) => {
      if (inScope.has(p.destinationChain)) return true;
      warn(`${p.sourceChain}: path to ${p.destinationChain} dropped — destination not in the scan set`);
      return false;
    });

    pathsByNetwork[network] = sortPaths(usable);
    infoByNetwork[network] = await fetchTokenInfo(network, usable);
    console.log(`  => ${usable.length} usable paths on ${network}`);
  }

  const target = join(__dirname, "..", "src", "generated", "supportedPaths.ts");
  writeFileSync(target, render(pathsByNetwork, infoByNetwork, generatedAt));
  console.log(`\nWrote ${target}`);

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
