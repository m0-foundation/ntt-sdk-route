import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ChainAddress,
  chainToChainId,
  Network,
} from "@wormhole-foundation/sdk-connect";
import { SolanaChains } from "@wormhole-foundation/sdk-solana";
import { SolanaNtt } from "@wormhole-foundation/sdk-solana-ntt";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Ntt } from "@wormhole-foundation/sdk-definitions-ntt";
import BN from "bn.js";
import { sha256 } from "@noble/hashes/sha2";

// Solana only has Mainnet and Testnet (which is devnet)
type SolanaNetwork = Exclude<Network, "Devnet">;

type ExtensionDetails = {
  program: PublicKey;
  tokenProgram: PublicKey;
};

const PROGRAMS = {
  Mainnet: {
    swap: new PublicKey("MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"),
    earn: new PublicKey("mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"),
    lut: new PublicKey("9JLRqBqkznKiSoNfotA4ywSRdnWb2fE76SiFrAfkaRCD"),
    mMint: new PublicKey("mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"),
    portal: new PublicKey("mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY"),
    quoter: new PublicKey("Nqd6XqA8LbsCuG8MLWWuP865NV6jR1MbXeKxD4HLKDJ"),
  },
  Testnet: {
    swap: new PublicKey("MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"),
    earn: new PublicKey("mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"),
    lut: new PublicKey("6GhuWPuAmiJeeSVsr58KjqHcAejJRndCx9BVtHkaYHUR"),
    mMint: new PublicKey("mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"),
    portal: new PublicKey("mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY"),
    quoter: new PublicKey("Nqd6XqA8LbsCuG8MLWWuP865NV6jR1MbXeKxD4HLKDJ"),
  },
};

const EXT_PROGRAMS: Record<SolanaNetwork, Record<string, ExtensionDetails>> = {
  Mainnet: {
    mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp: {
      program: new PublicKey("wMXX1K1nca5W4pZr1piETe78gcAVVrEFi9f4g46uXko"),
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    },
    usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX: {
      program: new PublicKey("extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw"),
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    },
    usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf: {
      program: new PublicKey("extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85"),
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    },
  },
  Testnet: {
    mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp: {
      program: new PublicKey("wMXX1K1nca5W4pZr1piETe78gcAVVrEFi9f4g46uXko"),
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    },
    usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX: {
      program: new PublicKey("Fb2AsCKmPd4gKhabT6KsremSHMrJ8G2Mopnc6rDQZX9e"),
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    },
    usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf: {
      program: new PublicKey("3PskKTHgboCbUSQPMcCAZdZNFHbNvSoZ8zEFYANCdob7"),
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    },
  },
};

export function getSolanaContracts(
  network: Network
): Ntt.Contracts & { mLikeTokens: string[] } {
  if (network === "Devnet") {
    throw new Error("Solana does not support Devnet for NTT contracts");
  }
  return {
    token: PROGRAMS[network].mMint.toBase58(),
    mLikeTokens: Object.keys(EXT_PROGRAMS[network]),
    manager: PROGRAMS[network].portal.toBase58(),
    transceiver: { wormhole: PROGRAMS[network].portal.toBase58() },
    quoter: PROGRAMS[network].quoter.toBase58(),
  };
}

export function getTransferExtensionBurnIx<
  N extends Network,
  C extends SolanaChains
>(
  ntt: SolanaNtt<N, C>,
  network: Network,
  amount: bigint,
  recipient: ChainAddress,
  payer: PublicKey,
  outboxItem: PublicKey,
  extMint: PublicKey,
  destinationToken: Uint8Array,
  shouldQueue = true
): TransactionInstruction {
  if (network === "Devnet") {
    throw new Error("Solana does not support Devnet for NTT contracts");
  }

  const programs = PROGRAMS[network];
  const extPrograms = EXT_PROGRAMS[network];

  const recipientAddress = Buffer.alloc(32);
  const dest = Buffer.from(recipient.address.toUint8Array());
  dest.copy(recipientAddress);

  if (destinationToken.length !== 32) {
    throw new Error(
      `destinationToken must be 32 bytes, got ${destinationToken.length} bytes`
    );
  }

  const extension = extPrograms[extMint.toBase58()];
  if (!extension) {
    throw new Error(
      `No extension program found for mint ${extMint.toBase58()}`
    );
  }

  const { program: extProgram, tokenProgram: extTokenProgram } = extension;

  return new TransactionInstruction({
    programId: ntt.program.programId,
    keys: [
      {
        pubkey: payer,
        isSigner: true,
        isWritable: true,
      },
      {
        // config
        pubkey: ntt.pdas.configAccount(),
        isSigner: false,
        isWritable: false,
      },
      {
        // m mint
        pubkey: programs.mMint,
        isSigner: false,
        isWritable: true,
      },
      {
        // from (token auth m token account)
        pubkey: getAssociatedTokenAddressSync(
          programs.mMint,
          PublicKey.findProgramAddressSync(
            [Buffer.from("token_authority")],
            ntt.program.programId
          )[0],
          true,
          TOKEN_2022_PROGRAM_ID
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        // m token program
        pubkey: TOKEN_2022_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        // outbox item
        pubkey: outboxItem,
        isSigner: true,
        isWritable: true,
      },
      {
        // outbox rate limit
        pubkey: ntt.pdas.outboxRateLimitAccount(),
        isSigner: false,
        isWritable: true,
      },
      {
        // custody
        pubkey: ntt.config!.custody,
        isSigner: false,
        isWritable: true,
      },
      {
        // system program
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        // inbox rate limit
        pubkey: ntt.pdas.inboxRateLimitAccount(recipient.chain),
        isSigner: false,
        isWritable: true,
      },
      {
        // peer
        pubkey: ntt.pdas.peerAccount(recipient.chain),
        isSigner: false,
        isWritable: false,
      },
      {
        // session auth
        pubkey: ntt.pdas.sessionAuthority(new PublicKey(payer), {
          amount: new BN(amount),
          recipientChain: {
            id: 2, // Ethereum
          },
          recipientAddress: [...Array(32)],
          shouldQueue: false,
        }),
        isSigner: false,
        isWritable: false,
      },
      {
        // token auth
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("token_authority")],
          ntt.program.programId
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext mint
        pubkey: extMint,
        isSigner: false,
        isWritable: true,
      },
      {
        // swap global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          programs.swap
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // m global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          programs.earn
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          extProgram
        )[0],
        isSigner: false,
        isWritable: true,
      },
      {
        // ext token account
        pubkey: getAssociatedTokenAddressSync(
          extMint,
          payer,
          true,
          extTokenProgram
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        // ext m vault
        pubkey: getAssociatedTokenAddressSync(
          programs.mMint,
          PublicKey.findProgramAddressSync(
            [Buffer.from("m_vault")],
            extProgram
          )[0],
          true,
          TOKEN_2022_PROGRAM_ID
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        // ext m vault auth
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("m_vault")],
          extProgram
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext mint auth
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("mint_authority")],
          extProgram
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext program
        pubkey: extProgram,
        isSigner: false,
        isWritable: false,
      },
      {
        // swap program
        pubkey: programs.swap,
        isSigner: false,
        isWritable: false,
      },
      {
        // ext token program
        pubkey: extTokenProgram,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([
      Buffer.from(sha256("global:transfer_extension_burn").subarray(0, 8)),
      new BN(amount).toArrayLike(Buffer, "le", 8), // amount
      new BN(chainToChainId(recipient.chain)).toArrayLike(Buffer, "le", 2), // chain_id
      recipientAddress, // recipient_address
      destinationToken, // destination_token
      Buffer.from([Number(shouldQueue)]), // should_queue
    ]),
  });
}

export function getReleaseInboundMintExtensionIx<
  N extends Network,
  C extends SolanaChains
>(
  ntt: SolanaNtt<N, C>,
  network: Network,
  payer: string,
  inboxItem: PublicKey,
  mMint: PublicKey,
  extMint: PublicKey,
  extAta: PublicKey
): TransactionInstruction {
  if (network === "Devnet") {
    throw new Error("Solana does not support Devnet for NTT contracts");
  }

  const programs = PROGRAMS[network];
  const extPrograms = EXT_PROGRAMS[network];

  const extension = extPrograms[extMint.toBase58()];
  if (!extension) {
    throw new Error(
      `No extension program found for mint ${extMint.toBase58()}`
    );
  }

  const { program: extProgram, tokenProgram: extTokenProgram } = extension;

  return new TransactionInstruction({
    programId: ntt.program.programId,
    keys: [
      {
        pubkey: new PublicKey(payer),
        isSigner: true,
        isWritable: true,
      },
      {
        // config
        pubkey: ntt.pdas.configAccount(),
        isSigner: false,
        isWritable: false,
      },
      {
        // inbox item
        pubkey: inboxItem,
        isSigner: false,
        isWritable: true,
      },
      {
        // recipient (mint to token auth which wraps to user)
        pubkey: getAssociatedTokenAddressSync(
          mMint,
          PublicKey.findProgramAddressSync(
            [Buffer.from("token_authority")],
            ntt.program.programId
          )[0],
          true,
          TOKEN_2022_PROGRAM_ID
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        // token auth
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("token_authority")],
          ntt.program.programId
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // m mint
        pubkey: mMint,
        isSigner: false,
        isWritable: true,
      },
      {
        // m token program
        pubkey: TOKEN_2022_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        // custody
        pubkey: ntt.config!.custody,
        isSigner: false,
        isWritable: true,
      },
      {
        // earn program
        pubkey: programs.earn,
        isSigner: false,
        isWritable: false,
      },
      {
        // m global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          programs.earn
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext mint
        pubkey: extMint,
        isSigner: false,
        isWritable: true,
      },
      {
        // swap global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          programs.swap
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          extProgram
        )[0],
        isSigner: false,
        isWritable: true,
      },
      {
        // ext m vault auth
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("m_vault")],
          extProgram
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext mint auth
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("mint_authority")],
          extProgram
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // ext m vault
        pubkey: getAssociatedTokenAddressSync(
          mMint,
          PublicKey.findProgramAddressSync(
            [Buffer.from("m_vault")],
            extProgram
          )[0],
          true,
          TOKEN_2022_PROGRAM_ID
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        // ext token account
        pubkey: extAta,
        isSigner: false,
        isWritable: true,
      },
      {
        // ext token account
        pubkey: programs.swap,
        isSigner: false,
        isWritable: false,
      },
      {
        // ext program
        pubkey: extProgram,
        isSigner: false,
        isWritable: false,
      },
      {
        // ext token program
        pubkey: extTokenProgram,
        isSigner: false,
        isWritable: false,
      },
      {
        // system program
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([
      Buffer.from(
        sha256("global:release_inbound_mint_extension").subarray(0, 8)
      ),
    ]),
  });
}

export async function getAddressLookupTableAccounts(
  connection: Connection,
  network: Network
): Promise<AddressLookupTableAccount> {
  const table =
    network === "Testnet" ? PROGRAMS.Testnet.lut : PROGRAMS.Mainnet.lut;

  const info = await connection.getAccountInfo(table);

  return new AddressLookupTableAccount({
    key: new PublicKey(table),
    state: AddressLookupTableAccount.deserialize(info!.data),
  });
}
