import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
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
import BN from "bn.js";
import { sha256 } from "@noble/hashes/sha2";

const SWAP_PROGRAM = new PublicKey(
  "MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"
);
const EARN_PROGRAM = new PublicKey(
  "mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"
);

export async function getTransferBurnExtensionIx<
  N extends Network,
  C extends SolanaChains
>(
  ntt: SolanaNtt<N, C>,
  amount: number,
  destination: ChainAddress,
  payer: string,
  outboxItem: PublicKey,
  mMint: PublicKey,
  extProgram: PublicKey,
  extMint: PublicKey,
  extAta: PublicKey,
  extTokenProgram: PublicKey,
  destinationToken: Buffer,
  shouldQueue = true
): Promise<TransactionInstruction> {
  const recipientAddress = Buffer.alloc(32);
  const dest = Buffer.from(destination.address.toUint8Array());
  dest.copy(recipientAddress);

  if (destinationToken.length !== 32) {
    throw new Error(
      `destinationToken must be 32 bytes, got ${destinationToken.length} bytes`
    );
  }

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
        // m mint
        pubkey: mMint,
        isSigner: false,
        isWritable: true,
      },
      {
        // from (token auth m token account)
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
        pubkey: ntt.pdas.inboxRateLimitAccount(destination.chain),
        isSigner: false,
        isWritable: true,
      },
      {
        // peer
        pubkey: ntt.pdas.peerAccount(destination.chain),
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
          SWAP_PROGRAM
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // m global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          EARN_PROGRAM
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
        pubkey: extAta,
        isSigner: false,
        isWritable: true,
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
        pubkey: SWAP_PROGRAM,
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
        // ata program
        pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([
      Buffer.from(sha256("global:transfer_extension_burn").subarray(0, 8)),
      new BN(amount).toArrayLike(Buffer, "le", 8), // amount
      new BN(chainToChainId(destination.chain)).toArrayLike(Buffer, "le", 2), // chain_id
      recipientAddress, // recipient_address
      destinationToken, // destination_token
      Buffer.from([Number(shouldQueue)]), // should_queue
    ]),
  });
}
