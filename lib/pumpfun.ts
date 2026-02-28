import { Keypair, VersionedTransaction } from "@solana/web3.js";

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
  amount: number | string; // number for buy, number or "100%" for sell
  slippage: number;
  denominatedInSol: boolean;
  priorityFee: number;
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

async function fetchTransaction(body: Record<string, unknown>): Promise<VersionedTransaction> {
  const response = await fetch("/api/trade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const err = await response.json();
    throw new Error(err.error || `API error (${response.status})`);
  }

  if (response.status !== 200) {
    throw new Error(`API error (${response.status})`);
  }

  const data = await response.arrayBuffer();
  if (data.byteLength === 0) {
    throw new Error("Received empty transaction from PumpPortal");
  }

  return VersionedTransaction.deserialize(new Uint8Array(data));
}

/**
 * Build a create-token transaction via PumpPortal.
 * Always creates with amount: 0 to avoid the on-chain arithmetic overflow
 * (error 6024) that occurs when combining create + buy in one instruction.
 */
export async function createTokenTransaction(
  publicKey: string,
  metadataUri: string,
  metadata: TokenMetadata,
  mintKeypair: Keypair
): Promise<VersionedTransaction> {
  return fetchTransaction({
    publicKey,
    action: "create",
    tokenMetadata: {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
    },
    mint: mintKeypair.publicKey.toBase58(),
    denominatedInSol: "true",
    amount: 0,
    slippage: 10,
    priorityFee: 0.0005,
    pool: "pump",
  });
}

/**
 * Build a buy transaction for the initial dev buy (separate from create)
 */
export async function buildBuyTransaction(
  publicKey: string,
  mint: string,
  solAmount: number,
  slippage: number,
  priorityFee: number
): Promise<VersionedTransaction> {
  return fetchTransaction({
    publicKey,
    action: "buy",
    mint,
    denominatedInSol: "true",
    amount: solAmount,
    slippage,
    priorityFee,
    pool: "auto",
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a buy/sell transaction via PumpPortal
 */
export async function tradeTransaction(
  publicKey: string,
  params: TradeParams
): Promise<VersionedTransaction> {
  return fetchTransaction({
    publicKey,
    action: params.action,
    mint: params.mint,
    denominatedInSol: params.denominatedInSol ? "true" : "false",
    amount: params.amount,
    slippage: params.slippage,
    priorityFee: params.priorityFee,
    pool: "pump",
  });
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
