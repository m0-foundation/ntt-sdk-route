import { Connection, Keypair } from "@solana/web3.js";
import { Portal } from "./idls/portal";
import PORTAL from "./idls/portal.json";
import { WormholeAdapter } from "./idls/wormhole_adapter";
import WORMHOLE_ADAPTER from "./idls/wormhole_adapter.json";
import { ExtSwap } from "./idls/ext_swap";
import EXT_SWAP from "./idls/ext_swap.json";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Contract, Provider } from "ethers";
import portalAbi from "./abis/portal.json";

export const svmPortalProvider = (connection: Connection): Program<Portal> => {
  const key = Keypair.generate();
  const dummyProvider = new AnchorProvider(connection, new NodeWallet(key));
  return new Program<Portal>(PORTAL, dummyProvider);
};

export const svmWormholeAdapterProvider = (
  connection: Connection,
): Program<WormholeAdapter> => {
  const key = Keypair.generate();
  const dummyProvider = new AnchorProvider(connection, new NodeWallet(key));
  return new Program<WormholeAdapter>(WORMHOLE_ADAPTER, dummyProvider);
};

export const svmSwapFacilityProvider = (
  connection: Connection,
): Program<ExtSwap> => {
  const key = Keypair.generate();
  const dummyProvider = new AnchorProvider(connection, new NodeWallet(key));
  return new Program<ExtSwap>(EXT_SWAP, dummyProvider);
};

export const evmPortalProvider = (provider: Provider) => {
  return new Contract(
    "0xD925C84b55E4e44a53749fF5F2a5A13F63D128fd",
    portalAbi,
    provider,
  );
};
