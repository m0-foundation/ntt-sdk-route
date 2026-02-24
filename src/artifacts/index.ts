import { Connection, Keypair } from "@solana/web3.js";
import { Portal } from "./portal";
import PORTAL from "./portal.json";
import { WormholeAdapter } from "./wormhole_adapter";
import WORMHOLE_ADAPTER from "./wormhole_adapter.json";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

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
