import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { Portal } from "./idls/portal";
import PORTAL from "./idls/portal.json";
import { WormholeAdapter } from "./idls/wormhole_adapter";
import WORMHOLE_ADAPTER from "./idls/wormhole_adapter.json";
import { ExtSwap } from "./idls/ext_swap";
import EXT_SWAP from "./idls/ext_swap.json";
import { Contract, Provider } from "ethers";
import portalAbi from "./abis/portal.json";

function dummyWallet() {
  const key = Keypair.generate();
  return {
    publicKey: key.publicKey,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  } as any;
}

function createProgram<T>(connection: Connection, idl: any): Program<T> {
  return new Program<T>(idl, new AnchorProvider(connection, dummyWallet()));
}

export const svmPortalProvider = (
  connection: Connection,
): Program<Portal> => createProgram<Portal>(connection, PORTAL);

export const svmWormholeAdapterProvider = (
  connection: Connection,
): Program<WormholeAdapter> =>
  createProgram<WormholeAdapter>(connection, WORMHOLE_ADAPTER);

export const svmSwapFacilityProvider = (
  connection: Connection,
): Program<ExtSwap> => createProgram<ExtSwap>(connection, EXT_SWAP);

export const evmPortalProvider = (provider: Provider) => {
  return new Contract(
    "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd",
    portalAbi,
    provider,
  );
};
