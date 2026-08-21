import { Chain, Network, TokenId, toNative } from "@wormhole-foundation/sdk-connect";
import {
  GeneratedBridgePath,
  GeneratedTokenInfo,
  SUPPORTED_PATHS,
  TOKEN_INFO,
} from "./generated/supportedPaths";

/**
 * Read helpers over the generated path table.
 *
 * The table is a *candidate* set, refreshed daily from live Portal state. Callers
 * that are about to offer or execute a transfer must still confirm the path
 * against the Portal — see `EvmRouter.isSupportedPath`. A stale table can miss a
 * newly opened path, but it can never make the SDK offer one that would revert.
 */

/** Tokens are compared case-insensitively; EVM addresses are stored lowercase. */
function normalize(chain: Chain, token: string): string {
  return token.startsWith("0x") ? token.toLowerCase() : token;
}

function pathsFor(network: Network): GeneratedBridgePath[] {
  return SUPPORTED_PATHS[network] ?? [];
}

/** Every chain that appears on either end of a known path. */
export function knownChains(network: Network): Chain[] {
  const chains = new Set<Chain>();
  for (const path of pathsFor(network)) {
    chains.add(path.sourceChain);
    chains.add(path.destinationChain);
  }
  return [...chains].sort();
}

/** Tokens on `chain` that are the source of at least one known path. */
export function knownSourceTokens(network: Network, chain: Chain): string[] {
  const tokens = new Set<string>();
  for (const path of pathsFor(network)) {
    if (path.sourceChain === chain) tokens.add(path.sourceToken);
  }
  return [...tokens].sort();
}

/**
 * Every token seen on `chain`, as either endpoint. Used as the candidate set for
 * on-chain destination checks — wider than the recorded destinations for a single
 * source token, so a path opened between refreshes is still discovered.
 */
export function knownTokensOn(network: Network, chain: Chain): string[] {
  const tokens = new Set<string>();
  for (const path of pathsFor(network)) {
    if (path.sourceChain === chain) tokens.add(path.sourceToken);
    if (path.destinationChain === chain) tokens.add(path.destinationToken);
  }
  return [...tokens].sort();
}

/** Destination tokens recorded for this exact route at generation time. */
export function knownDestinationTokens(
  network: Network,
  fromChain: Chain,
  toChain: Chain,
  sourceToken: string,
): string[] {
  const wanted = normalize(fromChain, sourceToken);
  const tokens = new Set<string>();
  for (const path of pathsFor(network)) {
    if (
      path.sourceChain === fromChain &&
      path.destinationChain === toChain &&
      normalize(fromChain, path.sourceToken) === wanted
    ) {
      tokens.add(path.destinationToken);
    }
  }
  return [...tokens].sort();
}

/** True when the generated table has no knowledge of this chain pair at all. */
export function hasAnyPath(network: Network, fromChain: Chain, toChain: Chain): boolean {
  return pathsFor(network).some(
    (path) => path.sourceChain === fromChain && path.destinationChain === toChain,
  );
}

export function tokenInfo(
  network: Network,
  chain: Chain,
  token: string,
): GeneratedTokenInfo | undefined {
  return TOKEN_INFO[network]?.[chain]?.[normalize(chain, token)];
}

export function toTokenIds(chain: Chain, tokens: string[]): TokenId[] {
  return tokens.map((token) => ({ chain, address: toNative(chain, token) }));
}
