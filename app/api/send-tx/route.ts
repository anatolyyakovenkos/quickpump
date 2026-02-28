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
    const connection = new Connection(SOLANA_RPC_URL_SERVER, "confirmed");

    const signature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      maxRetries: 3,
    });

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, "confirmed");

    if (confirmation.value.err) {
      return NextResponse.json(
        { error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ signature });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
