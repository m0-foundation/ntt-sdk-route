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
import BN from "bn.js";
import { sha256 } from "@noble/hashes/sha2";

type ExtensionDetails = {
  program: PublicKey;
  tokenProgram: PublicKey;
};

const PROGRAMS = {
  swap: new PublicKey("MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"),
  earn: new PublicKey("mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"),
  mMint: new PublicKey("mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"),
  luts: [
    new PublicKey("6GhuWPuAmiJeeSVsr58KjqHcAejJRndCx9BVtHkaYHUR"),
    new PublicKey("9JLRqBqkznKiSoNfotA4ywSRdnWb2fE76SiFrAfkaRCD"),
  ],
};

const EXT_PROGRAMS: Record<string, ExtensionDetails> = {
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
};

export function getTransferExtensionBurnIx<
  N extends Network,
  C extends SolanaChains
>(
  ntt: SolanaNtt<N, C>,
  amount: bigint,
  recipient: ChainAddress,
  payer: PublicKey,
  outboxItem: PublicKey,
  extMint: PublicKey,
  destinationToken: Uint8Array,
  shouldQueue = true
): TransactionInstruction {
  const recipientAddress = Buffer.alloc(32);
  const dest = Buffer.from(recipient.address.toUint8Array());
  dest.copy(recipientAddress);

  if (destinationToken.length !== 32) {
    throw new Error(
      `destinationToken must be 32 bytes, got ${destinationToken.length} bytes`
    );
  }

  const extension = EXT_PROGRAMS[extMint.toBase58()];
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
        pubkey: PROGRAMS.mMint,
        isSigner: false,
        isWritable: true,
      },
      {
        // from (token auth m token account)
        pubkey: getAssociatedTokenAddressSync(
          PROGRAMS.mMint,
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
          PROGRAMS.swap
        )[0],
        isSigner: false,
        isWritable: false,
      },
      {
        // m global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          PROGRAMS.earn
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
          PROGRAMS.mMint,
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
        pubkey: PROGRAMS.swap,
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
  payer: string,
  inboxItem: PublicKey,
  mMint: PublicKey,
  extMint: PublicKey,
  extAta: PublicKey
): TransactionInstruction {
  const extension = EXT_PROGRAMS[extMint.toBase58()];
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
            extProgram
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
        pubkey: PROGRAMS.earn,
        isSigner: false,
        isWritable: false,
      },
      {
        // m global
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          PROGRAMS.earn
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
          PROGRAMS.swap
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
        pubkey: PROGRAMS.swap,
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
        sha256("global:release_inbound_mint_extension_multisig").subarray(0, 8)
      ),
    ]),
  });
}

export async function getAddressLookupTableAccounts(
  connection: Connection
): Promise<AddressLookupTableAccount[]> {
  const addressLookupTableAccountInfos =
    await connection.getMultipleAccountsInfo(PROGRAMS.luts);

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = PROGRAMS.luts[index];
    if (accountInfo) {
      const addressLookupTableAccount = new AddressLookupTableAccount({
        key: new PublicKey(addressLookupTableAddress),
        state: AddressLookupTableAccount.deserialize(accountInfo.data),
      });
      acc.push(addressLookupTableAccount);
    }

    return acc;
  }, new Array<AddressLookupTableAccount>());
}
