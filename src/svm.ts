import {
  createAssociatedTokenAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  Chain,
  ChainAddress,
  chainToChainId,
  Network,
  toUniversal,
} from "@wormhole-foundation/sdk-connect";
import { SolanaChains } from "@wormhole-foundation/sdk-solana";
import { NTT, SolanaNtt } from "@wormhole-foundation/sdk-solana-ntt";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Ntt, NttWithExecutor } from "@wormhole-foundation/sdk-definitions-ntt";
import BN from "bn.js";
import { sha256 } from "@noble/hashes/sha2";

type SvmNetwork = Exclude<Network, "Devnet">;

type ExtensionDetails = {
  program: PublicKey;
  tokenProgram: PublicKey;
};

export class SolanaRoutes<N extends Network, C extends SolanaChains> {
  ntt: SolanaNtt<N, C>;
  network: SvmNetwork;
  programs: Record<string, PublicKey>;
  extPrograms: Record<string, ExtensionDetails>;

  constructor(ntt: SolanaNtt<N, C>) {
    this.ntt = ntt;
    this.network = ntt.network as SvmNetwork;
    this.programs = SolanaRoutes.getPrograms(this.network);
    this.extPrograms = SolanaRoutes.getExtPrograms(
      this.network,
      this.ntt.chain
    );
  }

  private static getPrograms(network: SvmNetwork): Record<string, PublicKey> {
    return {
      Mainnet: {
        swap: pk("MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"),
        earn: pk("mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"),
        lut: pk("9JLRqBqkznKiSoNfotA4ywSRdnWb2fE76SiFrAfkaRCD"),
        mMint: pk("mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH"),
        portal: pk("mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY"),
        quoter: pk("Nqd6XqA8LbsCuG8MLWWuP865NV6jR1MbXeKxD4HLKDJ"),
      },
      Testnet: {
        swap: pk("MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH"),
        earn: pk("mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z"),
        lut: pk("6GhuWPuAmiJeeSVsr58KjqHcAejJRndCx9BVtHkaYHUR"),
        mMint: pk("mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH"),
        portal: pk("mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY"),
        quoter: pk("Nqd6XqA8LbsCuG8MLWWuP865NV6jR1MbXeKxD4HLKDJ"),
      },
    }[network];
  }

  private static getExtPrograms(
    network: SvmNetwork,
    chain: SolanaChains
  ): Record<string, ExtensionDetails> {
    if (chain === "Fogo") {
      // Fogo addresses the same for devnet and mainnet
      return {
        fUSDqquEMUU8UmU2YWYGZy2Lda1oMzBc88Mkzc1PRDw: {
          program: pk("extUkDFf3HLekkxbcZ3XRUizMjbxMJgKBay3p9xGVmg"),
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      };
    }

    return {
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

  static getSolanaContracts(
    network: Network,
    chain: SolanaChains
  ): Ntt.Contracts & { mLikeTokens: string[] } {
    const programs = SolanaRoutes.getPrograms(network as SvmNetwork);
    const extPrograms = SolanaRoutes.getExtPrograms(
      network as SvmNetwork,
      chain
    );

    return {
      token: programs.mMint.toBase58(),
      mLikeTokens: Object.keys(extPrograms),
      manager: programs.portal.toBase58(),
      transceiver: { wormhole: programs.portal.toBase58() },
      quoter: programs.quoter.toBase58(),
    };
  }

  getSolanaContracts(): Ntt.Contracts & { mLikeTokens: string[] } {
    return SolanaRoutes.getSolanaContracts(this.network, this.ntt.chain);
  }

  getTransferExtensionBurnIx(
    amount: bigint,
    recipient: ChainAddress,
    payer: PublicKey,
    outboxItem: PublicKey,
    extMint: PublicKey,
    destinationToken: Uint8Array,
    shouldQueue = true
  ): TransactionInstruction {
    const recipientAddress = toUniversal(
      recipient.chain,
      recipient.address.toString()
    ).toUint8Array();

    if (recipientAddress.length !== 32) {
      throw new Error(
        `recipient address must be 32 bytes, got ${recipientAddress.length} bytes`
      );
    }
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

    const [tokenAuth] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_authority")],
      this.programs.portal
    );
    const sessionAuth = this.ntt.pdas.sessionAuthority(tokenAuth, {
      amount: new BN(amount),
      recipientChain: { id: chainToChainId(recipient.chain) },
      recipientAddress: [...recipientAddress],
      shouldQueue,
    });

    return new TransactionInstruction({
      programId: this.ntt.program.programId,
      keys: [
        {
          pubkey: payer,
          isSigner: true,
          isWritable: true,
        },
        {
          // config
          pubkey: this.ntt.pdas.configAccount(),
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
            tokenAuth,
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
          pubkey: this.ntt.pdas.outboxRateLimitAccount(),
          isSigner: false,
          isWritable: true,
        },
        {
          // custody
          pubkey: this.ntt.config!.custody,
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
          pubkey: this.ntt.pdas.inboxRateLimitAccount(recipient.chain),
          isSigner: false,
          isWritable: true,
        },
        {
          // peer
          pubkey: this.ntt.pdas.peerAccount(recipient.chain),
          isSigner: false,
          isWritable: false,
        },
        {
          // session auth
          pubkey: sessionAuth,
          isSigner: false,
          isWritable: false,
        },
        {
          // token auth
          pubkey: tokenAuth,
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
        Buffer.from([Number(shouldQueue)]), // should_queue
        destinationToken, // destination_token
      ]),
    });
  }

  getExecutorRelayIx(
    sender: PublicKey,
    quote: NttWithExecutor.Quote,
    destinationChain: Chain,
    outboxItem: PublicKey
  ): TransactionInstruction {
    const nttPeer = PublicKey.findProgramAddressSync(
      [
        Buffer.from("peer"),
        new BN(chainToChainId(destinationChain)).toArrayLike(Buffer, "le", 2),
      ],
      this.programs.portal
    )[0];

    const signedQuoteBytes = Buffer.from(quote.signedQuote);
    const relayInstructions = Buffer.from(quote.relayInstructions);

    return new TransactionInstruction({
      keys: [
        {
          pubkey: sender,
          isSigner: true,
          isWritable: true,
        },
        {
          // payee
          pubkey: new PublicKey(quote.payeeAddress),
          isSigner: false,
          isWritable: true,
        },
        {
          // ntt_program_id
          pubkey: this.programs.portal,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: nttPeer,
          isSigner: false,
          isWritable: false,
        },
        {
          // ntt_message
          pubkey: outboxItem,
          isSigner: false,
          isWritable: false,
        },
        {
          // executor_program
          pubkey: new PublicKey("execXUrAsMnqMmTHj5m7N1YQgsDz3cwGLYCYyuDRciV"),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: new PublicKey("nex1gkSWtRBheEJuQZMqHhbMG5A45qPU76KqnCZNVHR"),
      data: Buffer.concat([
        Buffer.from(sha256("global:relay_ntt_mesage").subarray(0, 8)),
        new BN(chainToChainId(destinationChain)).toArrayLike(Buffer, "le", 2), // recipient_chain
        new BN(signedQuoteBytes.length).toArrayLike(Buffer, "le", 4), // vec length
        Buffer.from(signedQuoteBytes), // signed_quote_bytes
        new BN(relayInstructions.length).toArrayLike(Buffer, "le", 4), // vec length
        Buffer.from(relayInstructions), // relay_instructions
      ]),
    });
  }

  getReleaseInboundMintExtensionIx(
    nttMessage: Ntt.Message,
    emitterChain: Chain,
    payer: PublicKey,
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
      programId: this.ntt.program.programId,
      keys: [
        {
          pubkey: payer,
          isSigner: true,
          isWritable: true,
        },
        {
          // config
          pubkey: this.ntt.pdas.configAccount(),
          isSigner: false,
          isWritable: false,
        },
        {
          // inbox item
          pubkey: this.ntt.pdas.inboxItemAccount(emitterChain, nttMessage),
          isSigner: false,
          isWritable: true,
        },
        {
          // recipient (mint to token auth which wraps to user)
          pubkey: getAssociatedTokenAddressSync(
            this.ntt.config!.mint,
            PublicKey.findProgramAddressSync(
              [Buffer.from("token_authority")],
              this.ntt.program.programId
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
            this.ntt.program.programId
          )[0],
          isSigner: false,
          isWritable: false,
        },
        {
          // m mint
          pubkey: this.ntt.config!.mint,
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
          pubkey: this.ntt.config!.custody,
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
            this.ntt.config!.mint,
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

  static async createReleaseInboundMintInstruction<
    N extends Network,
    C extends SolanaChains
  >(
    ntt: SolanaNtt<N, C>,
    args: {
      payer: PublicKey;
      chain: Chain;
      nttMessage: Ntt.Message;
      recipient: PublicKey;
      revertWhenNotReady: boolean;
    }
  ): Promise<TransactionInstruction[]> {
    const router = new SolanaRoutes(ntt);

    // get target extension from ntt payload
    const { additionalPayload } = args.nttMessage.payload;

    if (additionalPayload.length < 40) {
      throw new Error(
        `Invalid additionalPayload length: ${additionalPayload.length}, expected at least 40 bytes`
      );
    }

    const destinationMint = new PublicKey(
      // first 8 bytes is the index, next 32 bytes is the mint address
      additionalPayload.slice(8, 40)
    );

    // bridge to $M, use standard release instruction
    if (destinationMint.equals(ntt.config!.mint)) {
      const ix = await NTT.createReleaseInboundMintInstruction(
        ntt.program,
        ntt.config!,
        args
      );

      // add extra accounts required for index propagation
      ix.keys.push(
        {
          pubkey: router.programs.earn,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: PublicKey.findProgramAddressSync(
            [Buffer.from("global")],
            router.programs.earn
          )[0],
          isSigner: false,
          isWritable: true,
        }
      );

      return [ix];
    }

    const extPrograms = router.extPrograms[destinationMint.toBase58()];
    if (!extPrograms) {
      throw new Error(
        `No extension program found for mint ${destinationMint.toBase58()}`
      );
    }

    const extAta = getAssociatedTokenAddressSync(
      destinationMint,
      args.recipient,
      true,
      extPrograms.tokenProgram
    );

    const ixs: TransactionInstruction[] = [];

    const acctInfo = await ntt.connection.getAccountInfo(extAta);
    if (acctInfo === null) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          args.payer,
          extAta,
          args.recipient,
          destinationMint,
          extPrograms.tokenProgram
        )
      );
    }

    ixs.push(
      router.getReleaseInboundMintExtensionIx(
        args.nttMessage,
        args.chain,
        args.payer,
        destinationMint,
        extAta
      )
    );

    return ixs;
  }
}

function pk(address: string): PublicKey {
  return new PublicKey(address);
}
