import { Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface TradeParams {
  action: "buy" | "sell";
  mint: string;
  amount: number | string;
  slippage: number;
  denominatedInSol: boolean;
  priorityFee: number;
}

export interface CreateResult {
  mint: string;
  transaction: VersionedTransaction;
  mintKeypair: Keypair;
}

/**
 * Upload token metadata + image to IPFS via pump.fun
 */
export async function uploadToIPFS(
  metadata: TokenMetadata,
  imageFile: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("name", metadata.name);
  formData.append("symbol", metadata.symbol);
  formData.append("description", metadata.description);
  if (metadata.twitter) formData.append("twitter", metadata.twitter);
  if (metadata.telegram) formData.append("telegram", metadata.telegram);
  if (metadata.website) formData.append("website", metadata.website);

  const response = await fetch("/api/ipfs", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `IPFS upload failed (${response.status})`);
  }

  const data = await response.json();
  if (!data.metadataUri) {
    throw new Error("IPFS upload succeeded but no metadata URI was returned");
  }
  return data.metadataUri;
}

/**
 * Create a token via PumpDev API (uses pump.fun's new program with create_v2).
 * Supports create + initial buy in a single transaction.
 */
export async function createToken(
  publicKey: string,
  name: string,
  symbol: string,
  metadataUri: string,
  buyAmountSol: number
): Promise<CreateResult> {
  const body: Record<string, unknown> = {
    publicKey,
    name,
    symbol,
    uri: metadataUri,
  };

  if (buyAmountSol > 0) {
    body.buyAmountSol = buyAmountSol;
    body.slippage = 30;
  }

  body.priorityFee = 0.0005;

  const response = await fetch("/api/create-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Token creation failed (${response.status})`);
  }

  const data = await response.json();

  if (!data.mint || !data.transaction || !data.mintSecretKey) {
    throw new Error("Invalid response from API — missing mint, transaction, or mintSecretKey");
  }

  const mintKeypair = Keypair.fromSecretKey(bs58.decode(data.mintSecretKey));
  const transaction = VersionedTransaction.deserialize(bs58.decode(data.transaction));

  return { mint: data.mint, transaction, mintKeypair };
}

/**
 * Build a buy/sell transaction via PumpPortal
 */
export async function tradeTransaction(
  publicKey: string,
  params: TradeParams
): Promise<VersionedTransaction> {
  const response = await fetch("/api/trade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey,
      action: params.action,
      mint: params.mint,
      denominatedInSol: params.denominatedInSol ? "true" : "false",
      amount: params.amount,
      slippage: params.slippage,
      priorityFee: params.priorityFee,
      pool: "auto",
    }),
  });

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const err = await response.json();
    throw new Error(err.error || `Trade transaction failed (${response.status})`);
  }

  if (response.status !== 200) {
    throw new Error(`Trade transaction failed (${response.status})`);
  }

  const data = await response.arrayBuffer();
  if (data.byteLength === 0) {
    throw new Error("Received empty transaction from API");
  }

  return VersionedTransaction.deserialize(new Uint8Array(data));
}

/**
 * Send a signed transaction to Solana via our server-side proxy
 */
export async function sendSignedTransaction(
  signedTx: VersionedTransaction
): Promise<string> {
  const rawTx = signedTx.serialize();

  const base64Tx =
    typeof Buffer !== "undefined"
      ? Buffer.from(rawTx).toString("base64")
      : btoa(String.fromCharCode(...rawTx));

  const response = await fetch("/api/send-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: base64Tx }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send transaction");
  }

  if (!data.signature) {
    throw new Error("Transaction sent but no signature returned");
  }

  return data.signature;
}
