import {
  Chain,
  ChainContext,
  chainToChainId,
  chainToPlatform,
  Network,
  sha256,
  TokenId,
  UniversalAddress,
} from "@wormhole-foundation/sdk-connect";
import { NttWithExecutor } from "@wormhole-foundation/sdk-definitions-ntt";
import {
  svmPortalProvider,
  svmSwapFacilityProvider,
  svmWormholeAdapterProvider,
} from "./artifacts";
import {
  AccountMeta,
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
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

export class SvmRouter {
  private static instance: SvmRouter | null = null;
  static evmPeer = "0xeAae496BcDa93cCCd3fD6ff6096347979e87B153";

  constructor(
    public connection: Connection,
    public chain: Chain,
    public network: Exclude<Network, "Devnet">,
    private cachedLookupTable: AddressLookupTableAccount | null = null,
    private tokens: Record<string, extensionToken> | null = null,
  ) {}

  static async fromChainContext(ctx: ChainContext<Network>) {
    if (chainToPlatform(ctx.chain) !== "Solana") {
      throw new Error(`Unsupported svm chain: ${ctx.chain}`);
    }

    if (!SvmRouter.instance) {
      SvmRouter.instance = new SvmRouter(
        await ctx.getRpc(),
        ctx.chain,
        ctx.network as Exclude<Network, "Devnet">,
      );
    }

    return SvmRouter.instance;
  }

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
      extension.tokenProgram,
    );

    return svmPortalProvider(this.connection)
      .methods.sendToken(
        new BN(amount),
        SvmRouter.hexToBytes32(destinationToken),
        getM0ChainId(destinationChain, this.network),
        SvmRouter.hexToBytes32(recipient),
      )
      .accounts({
        sender,
        bridgeAdapter: svmWormholeAdapterProvider(this.connection).programId,
        extensionMint: sourceToken,
        extensionTokenAccount,
        extensionProgram: extension.extensionProgram,
        mTokenProgram: TOKEN_2022_PROGRAM_ID,
        extensionTokenProgram: extension.tokenProgram,
      })
      .remainingAccounts(this.getRemainingAccounts())
      .instruction();
  }

  async getSupportedExtensions() {
    if (this.tokens) {
      return this.tokens;
    }

    const portalProgram = svmPortalProvider(this.connection);
    const swapProgram = svmSwapFacilityProvider(this.connection);

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
          SvmRouter.bytes32toHex(destinationToken),
        );
      }
    }

    return this.tokens;
  }

  async getSupportedSourceTokens(): Promise<TokenId[]> {
    const extensions = await this.getSupportedExtensions();
    const extensionsWithPath = Object.keys(extensions).filter((mint) => {
      const dests = extensions[mint].destinations;
      return Object.keys(dests).length > 0;
    });

    return extensionsWithPath.map((mint) => ({
      chain: this.chain,
      address: new UniversalAddress(mint, "base58"),
    }));
  }

  async getSupportedDestinationTokens(
    token: string,
    toChain: Chain,
  ): Promise<TokenId[]> {
    const extensions = await this.getSupportedExtensions();
    const extension = extensions[token];
    if (!extension) return [];

    const chainId = getM0ChainId(toChain, this.network);
    const dests = extension.destinations[chainId];
    if (!dests) return [];

    return Array.from(dests).map((dest) => ({
      chain: toChain,
      address: new UniversalAddress(dest, "hex"),
    }));
  }

  async getAddressLookupTableAccounts(): Promise<AddressLookupTableAccount> {
    if (this.cachedLookupTable) return this.cachedLookupTable;

    // Fetch the address table from the wormhole adapter's global state
    const program = svmWormholeAdapterProvider(this.connection);
    const globalInfo = await program.account.wormholeGlobal.fetch(
      PublicKey.findProgramAddressSync(
        [Buffer.from("global")],
        program.programId,
      )[0],
    );

    // Fetch the address table account
    const info = await this.connection.getAccountInfo(globalInfo!.receiveLut!);

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
      svmWormholeAdapterProvider(this.connection).programId,
    )[0];

    const bridgeSequence = PublicKey.findProgramAddressSync(
      [Buffer.from("Sequence"), emitter.toBytes()],
      this.network === "Mainnet"
        ? new PublicKey("worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth")
        : new PublicKey("3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"),
    )[0];

    // Fetch the current sequence for relaying
    const info = await this.connection.getAccountInfo(bridgeSequence);
    const sequence = new BN(info!.data, "le");

    const vaaReqBytes = Buffer.concat([
      Buffer.from("ERV1"),
      new BN(chainToChainId(this.chain)).toArrayLike(Buffer, "be", 2),
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
        Buffer.from(SvmRouter.hexToBytes32(SvmRouter.evmPeer)),
        sender.toBuffer(),
        lengthPrefixed(signedQuoteBytes),
        lengthPrefixed(vaaReqBytes),
        lengthPrefixed(relayInstructions),
      ]),
    });
  }

  private getRemainingAccounts(): AccountMeta[] {
    const adapter = svmWormholeAdapterProvider(null as any).programId;

    // Wormhole network-specific accounts
    const bridgePrograms = {
      Mainnet: {
        config: new PublicKey("2yVjuQwpsvdsrywzsJJVs9Ueh4zayyo5DYJbBNc3DDpn"),
        core: new PublicKey("worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"),
        fee: new PublicKey("9bFNrXNb2WTx8fMHXCheaZqkLZ3YCCaiqTftHxeintHy"),
        shim: new PublicKey("EtZMZM22ViKMo4r5y4Anovs3wKQ2owUmDpjygnMMcdEX"),
      },
      Testnet: {
        config: new PublicKey("6bi4JGDoRwUs9TYBuvoA7dUVyikTJDrJsJU1ew6KVLiu"),
        core: new PublicKey("3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"),
        fee: new PublicKey("7s3a1ycs16d6SNDumaRtjcoyMaTDZPavzgsmS3uUZYWX"),
        shim: new PublicKey("EtZMZM22ViKMo4r5y4Anovs3wKQ2owUmDpjygnMMcdEX"),
      },
    }[this.network];

    // PDAs
    const [wormholeGlobal] = PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      adapter,
    );
    const [shimEa] = PublicKey.findProgramAddressSync(
      [Buffer.from("__event_authority")],
      bridgePrograms.shim,
    );
    const [emitter] = PublicKey.findProgramAddressSync(
      [Buffer.from("emitter")],
      adapter,
    );
    const [sequence] = PublicKey.findProgramAddressSync(
      [Buffer.from("Sequence"), emitter.toBytes()],
      bridgePrograms.core,
    );
    const [message] = PublicKey.findProgramAddressSync(
      [emitter.toBytes()],
      bridgePrograms.shim,
    );

    return [
      { pubkey: wormholeGlobal, isSigner: false, isWritable: false },
      { pubkey: bridgePrograms.config, isSigner: false, isWritable: true },
      { pubkey: message, isSigner: false, isWritable: true },
      { pubkey: emitter, isSigner: false, isWritable: false },
      { pubkey: sequence, isSigner: false, isWritable: true },
      { pubkey: bridgePrograms.fee, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: bridgePrograms.core, isSigner: false, isWritable: false },
      { pubkey: shimEa, isSigner: false, isWritable: false },
      { pubkey: bridgePrograms.shim, isSigner: false, isWritable: false },
    ];
  }

  static hexToBytes32(hex: string): number[] {
    const bytes = Buffer.from(hex.replace("0x", ""), "hex");
    return Array.from(Buffer.concat([Buffer.alloc(32 - bytes.length), bytes]));
  }

  static bytes32toHex(bytes: number[]): string {
    return "0x" + Buffer.from(bytes.slice(12)).toString("hex");
  }
}
