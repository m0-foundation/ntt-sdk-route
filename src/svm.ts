import {
  Chain,
  chainToChainId,
  Network,
  sha256,
} from "@wormhole-foundation/sdk-connect";
import { SolanaChains } from "@wormhole-foundation/sdk-solana";
import { SolanaNtt } from "@wormhole-foundation/sdk-solana-ntt";
import { Ntt, NttWithExecutor } from "@wormhole-foundation/sdk-definitions-ntt";
import { svmPortalProvider, svmWormholeAdapterProvider } from "./artifacts";
import {
  AddressLookupTableAccount,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { getM0ChainId } from "./chainIds";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";

export class SolanaRouter<N extends Network, C extends SolanaChains> {
  private cachedLookupTable: AddressLookupTableAccount | null = null;

  constructor(private ntt: SolanaNtt<N, C>) {}

  async buildSendTokenInstruction(
    amount: bigint,
    sender: PublicKey,
    sourceToken: string,
    destinationToken: string,
    destinationChain: Chain,
    recipient: string,
  ): Promise<TransactionInstruction> {
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
        extensionTokenAccount: "",
        extensionProgram: "",
        mTokenProgram: TOKEN_2022_PROGRAM_ID,
        extensionTokenProgram: "",
      })
      .instruction();
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

    const info = await this.ntt.connection.getAccountInfo(bridgeSequence);
    const sequence = new BN(info!.data, "le");

    const vaaReqBytes = Buffer.concat([
      Buffer.from("ERV1"), // type
      new BN(chainToChainId(this.ntt.chain)).toArrayLike(Buffer, "be", 2), // emitter chain
      emitter.toBuffer(), // emitter address
      sequence.toArrayLike(Buffer, "be", 8), // sequence
    ]);

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
          pubkey: new PublicKey(quote.payeeAddress),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: new PublicKey("execXUrAsMnqMmTHj5m7N1YQgsDz3cwGLYCYyuDRciV"),
      data: Buffer.concat([
        Buffer.from(sha256("global:request_for_execution").subarray(0, 8)), // [109, 107, 87, 37, 151, 192, 119, 115]
        new BN(quote.estimatedCost.toString()).toArrayLike(Buffer, "le", 8), // amount
        new BN(chainToChainId(destinationChain)).toArrayLike(Buffer, "le", 2), // dst_chain
        this.ntt.program.programId.toBuffer(), // peer portal address
        sender.toBuffer(), // refund_addr
        new BN(signedQuoteBytes.length).toArrayLike(Buffer, "le", 4), // vec length
        signedQuoteBytes, // signed_quote_bytes
        new BN(vaaReqBytes.length).toArrayLike(Buffer, "le", 4), // vec length
        vaaReqBytes, // request_bytes
        new BN(relayInstructions.length).toArrayLike(Buffer, "le", 4), // vec length
        relayInstructions, // relay_instructions
      ]),
    });
  }

  static hexToBytes32(hex: string): number[] {
    const bytes = Buffer.from(hex.replace("0x", ""), "hex");
    return Array.from(Buffer.concat([Buffer.alloc(32 - bytes.length), bytes]));
  }
}
