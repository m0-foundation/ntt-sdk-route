import {
  Chain,
  chainToChainId,
  Network,
  sha256,
} from "@wormhole-foundation/sdk-connect";
import { SolanaChains } from "@wormhole-foundation/sdk-solana";
import { SolanaNtt } from "@wormhole-foundation/sdk-solana-ntt";
import { NttWithExecutor } from "@wormhole-foundation/sdk-definitions-ntt";
import {
  svmPortalProvider,
  svmSwapFacilityProvider,
  svmWormholeAdapterProvider,
} from "./artifacts";
import {
  AddressLookupTableAccount,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { getM0ChainId } from "./chainIds";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";

type extensionToken = {
  destinations: { [chainId: number]: Set<string> };
  extensionProgram: PublicKey;
  tokenProgram: PublicKey;
  mint: PublicKey;
};

export class SolanaRouter<N extends Network, C extends SolanaChains> {
  private cachedLookupTable: AddressLookupTableAccount | null = null;
  private tokens: Record<string, extensionToken> | null = null;

  constructor(private ntt: SolanaNtt<N, C>) {}

  async buildSendTokenInstruction(
    amount: bigint,
    sender: PublicKey,
    sourceToken: string,
    destinationToken: string,
    destinationChain: Chain,
    recipient: string,
  ): Promise<TransactionInstruction> {
    const extensions = await this.getSupportedExtensions();
    const extension = extensions[sourceToken];

    // Sender's token account
    const extensionTokenAccount = getAssociatedTokenAddressSync(
      extension.mint,
      sender,
      true,
      extension.extensionProgram,
    );

    return svmPortalProvider(this.ntt.connection)
      .methods.sendToken(
        new BN(amount),
        SolanaRouter.hexToBytes32(destinationToken),
        getM0ChainId(destinationChain, this.ntt.network),
        SolanaRouter.hexToBytes32(recipient),
      )
      .accounts({
        sender,
        bridgeAdapter: "", // TODO: finalize wormhole adapter chain id (and update IDL)
        extensionMint: sourceToken,
        extensionTokenAccount,
        extensionProgram: extension.extensionProgram,
        mTokenProgram: TOKEN_2022_PROGRAM_ID,
        extensionTokenProgram: extension.tokenProgram,
      })
      .instruction();
  }

  async getSupportedExtensions() {
    if (this.tokens) {
      return this.tokens;
    }

    const portalProgram = svmPortalProvider(this.ntt.connection);
    const swapProgram = svmSwapFacilityProvider(this.ntt.connection);

    // Extensions registered on the swap facility
    const swapGlobal = await swapProgram.account.swapGlobal.fetch(
      PublicKey.findProgramAddressSync(
        [Buffer.from("global")],
        swapProgram.programId,
      )[0],
    );

    this.tokens = {};

    for (const ext of swapGlobal.whitelistedExtensions) {
      this.tokens[ext.mint.toBase58()] = {
        destinations: {},
        extensionProgram: ext.programId,
        tokenProgram: ext.tokenProgram,
        mint: ext.mint,
      };
    }

    // Support bridging paths
    const paths = await portalProgram.account.chainBridgePaths.all();

    // Get supported destinations for each extension
    for (const path of paths) {
      const { destinationChainId } = path.account;
      for (const { sourceMint, destinationToken } of path.account.paths) {
        const dests = this.tokens[sourceMint.toBase58()].destinations;
        (dests[destinationChainId] ??= new Set()).add(
          SolanaRouter.bytes32toHex(destinationToken),
        );
      }
    }

    return this.tokens;
  }

  async getAddressLookupTableAccounts(): Promise<AddressLookupTableAccount> {
    if (this.cachedLookupTable) return this.cachedLookupTable;

    // Fetch the address table from the wormhole adapter's global state
    const program = svmWormholeAdapterProvider(this.ntt.connection);
    const globalInfo = await program.account.wormholeGlobal.fetch(
      PublicKey.findProgramAddressSync(
        [Buffer.from("global")],
        program.programId,
      )[0],
    );

    // Fetch the address table account
    const info = await this.ntt.connection.getAccountInfo(
      globalInfo!.receiveLut!,
    );

    this.cachedLookupTable = new AddressLookupTableAccount({
      key: globalInfo!.receiveLut!,
      state: AddressLookupTableAccount.deserialize(info!.data),
    });

    return this.cachedLookupTable;
  }

  async buildExecutorRelayInstruction(
    sender: PublicKey,
    quote: NttWithExecutor.Quote,
    destinationChain: Chain,
  ): Promise<TransactionInstruction> {
    const emitter = PublicKey.findProgramAddressSync(
      [Buffer.from("emitter")],
      this.ntt.program.programId,
    )[0];

    const bridgeSequence = PublicKey.findProgramAddressSync(
      [Buffer.from("Sequence"), emitter.toBytes()],
      new PublicKey(this.ntt.contracts.coreBridge!),
    )[0];

    // Fetch the current sequence for relaying
    const info = await this.ntt.connection.getAccountInfo(bridgeSequence);
    const sequence = new BN(info!.data, "le");

    const vaaReqBytes = Buffer.concat([
      Buffer.from("ERV1"),
      new BN(chainToChainId(this.ntt.chain)).toArrayLike(Buffer, "be", 2),
      emitter.toBuffer(),
      sequence.toArrayLike(Buffer, "be", 8),
    ]);

    const signedQuoteBytes = Buffer.from(quote.signedQuote);
    const relayInstructions = Buffer.from(quote.relayInstructions);
    const payee = new PublicKey(quote.payeeAddress);

    // Encoding vectors
    const lengthPrefixed = (buf: Buffer) =>
      Buffer.concat([new BN(buf.length).toArrayLike(Buffer, "le", 4), buf]);

    return new TransactionInstruction({
      keys: [
        { pubkey: sender, isSigner: true, isWritable: true },
        { pubkey: payee, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: new PublicKey("execXUrAsMnqMmTHj5m7N1YQgsDz3cwGLYCYyuDRciV"),
      data: Buffer.concat([
        Buffer.from(sha256("global:request_for_execution").subarray(0, 8)),
        new BN(quote.estimatedCost.toString()).toArrayLike(Buffer, "le", 8),
        new BN(chainToChainId(destinationChain)).toArrayLike(Buffer, "le", 2),
        this.ntt.program.programId.toBuffer(),
        sender.toBuffer(),
        lengthPrefixed(signedQuoteBytes),
        lengthPrefixed(vaaReqBytes),
        lengthPrefixed(relayInstructions),
      ]),
    });
  }

  static hexToBytes32(hex: string): number[] {
    const bytes = Buffer.from(hex.replace("0x", ""), "hex");
    return Array.from(Buffer.concat([Buffer.alloc(32 - bytes.length), bytes]));
  }

  static bytes32toHex(bytes: number[]): string {
    return "0x" + Buffer.from(bytes.slice(12)).toString("hex");
  }
}
