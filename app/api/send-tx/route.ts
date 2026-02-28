import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { SOLANA_RPC_URL_SERVER } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { transaction } = await req.json();

    if (!transaction) {
      return NextResponse.json({ error: "Missing transaction" }, { status: 400 });
    }

    const rawTx = Buffer.from(transaction, "base64");
    const connection = new Connection(SOLANA_RPC_URL_SERVER, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });

    // Use skipPreflight for pump.fun transactions — they often fail preflight
    // simulation but succeed on-chain due to timing-sensitive state
    const signature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      maxRetries: 5,
      preflightCommitment: "confirmed",
    });

    // Try to confirm but don't fail if it times out — the tx may still land
    try {
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        return NextResponse.json(
          {
            error: `Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`,
            signature,
          },
          { status: 400 }
        );
      }
    } catch (confirmErr) {
      // Confirmation timed out — tx may still land, return signature anyway
      console.warn("[send-tx] Confirmation timed out, tx may still land:", signature);
    }

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send transaction";
    console.error("[send-tx] Error:", message);

    // Provide helpful messages for common RPC errors
    if (message.includes("403") || message.includes("blocked")) {
      return NextResponse.json(
        {
          error:
            "RPC rejected the transaction. The public Solana RPC blocks sendTransaction. Please configure a paid RPC (Helius/QuickNode) in your environment variables.",
        },
        { status: 503 }
      );
    }
    if (message.includes("429") || message.includes("rate")) {
      return NextResponse.json(
        { error: "RPC rate limited. Please try again in a few seconds or use a paid RPC." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
