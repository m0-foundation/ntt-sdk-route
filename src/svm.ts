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

type SolanaNetwork = Exclude<Network, "Devnet">;

type ExtensionDetails = {
  program: PublicKey;
  tokenProgram: PublicKey;
};

export class SolanaRoutes {
  network: SolanaNetwork;
  programs: Record<string, PublicKey>;
  extPrograms: Record<string, ExtensionDetails>;

  constructor(network: Network) {
    // Solana devnet is labeled as Testnet in wormhole SDKs
    if (network === "Devnet") {
      throw new Error("Solana does not support Devnet for NTT contracts");
    }

    this.network = network;

    this.programs = {
      Mainnet: {
        swap: pk("MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"),
        earn: pk("mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"),
        lut: pk("9JLRqBqkznKiSoNfotA4ywSRdnWb2fE76SiFrAfkaRCD"),
        mMint: pk("mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo"),
        portal: pk("mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY"),
        quoter: pk("Nqd6XqA8LbsCuG8MLWWuP865NV6jR1MbXeKxD4HLKDJ"),
      },
      Testnet: {
        swap: pk("MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"),
        earn: pk("mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"),
        lut: pk("6GhuWPuAmiJeeSVsr58KjqHcAejJRndCx9BVtHkaYHUR"),
        mMint: pk("mzeroZRGCah3j5xEWp2Nih3GDejSBbH1rbHoxDg8By6"),
        portal: pk("mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY"),
        quoter: pk("Nqd6XqA8LbsCuG8MLWWuP865NV6jR1MbXeKxD4HLKDJ"),
      },
    }[network];

    this.extPrograms = {
      Mainnet: {
        mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp: {
          program: pk("wMXX1K1nca5W4pZr1piETe78gcAVVrEFi9f4g46uXko"),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        },
        usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX: {
          program: pk("extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw"),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        },
        usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf: {
          program: pk("extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85"),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        },
      },
      Testnet: {
        mzeroXDoBpRVhnEXBra27qzAMdxgpWVY3DzQW7xMVJp: {
          program: pk("wMXX1K1nca5W4pZr1piETe78gcAVVrEFi9f4g46uXko"),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        },
        usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX: {
          program: pk("Fb2AsCKmPd4gKhabT6KsremSHMrJ8G2Mopnc6rDQZX9e"),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        },
        usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf: {
          program: pk("3PskKTHgboCbUSQPMcCAZdZNFHbNvSoZ8zEFYANCdob7"),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        },
      },
    }[network];
  }

  getSolanaContracts(): Ntt.Contracts & { mLikeTokens: string[] } {
    return {
      token: this.programs.mMint.toBase58(),
      mLikeTokens: Object.keys(this.extPrograms),
      manager: this.programs.portal.toBase58(),
      transceiver: { wormhole: this.programs.portal.toBase58() },
      quoter: this.programs.quoter.toBase58(),
    };
  }

  getTransferExtensionBurnIx<N extends Network, C extends SolanaChains>(
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

    const extension = this.extPrograms[extMint.toBase58()];
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
          pubkey: this.programs.mMint,
          isSigner: false,
          isWritable: true,
        },
        {
          // from (token auth m token account)
          pubkey: getAssociatedTokenAddressSync(
            this.programs.mMint,
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
          pubkey: ntt.pdas.sessionAuthority(payer, {
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
            this.programs.swap
          )[0],
          isSigner: false,
          isWritable: false,
        },
        {
          // m global
          pubkey: PublicKey.findProgramAddressSync(
            [Buffer.from("global")],
            this.programs.earn
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
            this.programs.mMint,
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
          pubkey: this.programs.swap,
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

  getReleaseInboundMintExtensionIx<N extends Network, C extends SolanaChains>(
    ntt: SolanaNtt<N, C>,
    payer: string,
    inboxItem: PublicKey,
    mMint: PublicKey,
    extMint: PublicKey,
    extAta: PublicKey
  ): TransactionInstruction {
    const extension = this.extPrograms[extMint.toBase58()];
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
          pubkey: pk(payer),
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
          pubkey: this.programs.earn,
          isSigner: false,
          isWritable: false,
        },
        {
          // m global
          pubkey: PublicKey.findProgramAddressSync(
            [Buffer.from("global")],
            this.programs.earn
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
            this.programs.swap
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
          pubkey: this.programs.swap,
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

  async getAddressLookupTableAccounts(
    connection: Connection
  ): Promise<AddressLookupTableAccount> {
    const info = await connection.getAccountInfo(this.programs.lut);

    return new AddressLookupTableAccount({
      key: this.programs.lut,
      state: AddressLookupTableAccount.deserialize(info!.data),
    });
  }
}

function pk(address: string): PublicKey {
  return new PublicKey(address);
}
