import { Keypair, VersionedTransaction } from "@solana/web3.js";
import { getConnection } from "./solana";

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface CreateTokenParams {
  metadata: TokenMetadata;
  imageFile: File;
  initialBuyAmount: number;
  slippage: number;
  priorityFee: number;
}

export interface TradeParams {
  action: "buy" | "sell";
  mint: string;
  amount: number;
  slippage: number;
  denominatedInSol: boolean;
  priorityFee: number;
}

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
    throw new Error(err.error || `IPFS upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.metadataUri;
}

export async function createTokenTransaction(
  publicKey: string,
  metadataUri: string,
  metadata: TokenMetadata,
  mintKeypair: Keypair,
  initialBuyAmount: number,
  slippage: number,
  priorityFee: number
): Promise<VersionedTransaction> {
  const response = await fetch("/api/trade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey,
      action: "create",
      tokenMetadata: {
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: "true",
      amount: initialBuyAmount,
      slippage,
      priorityFee,
      pool: "pump",
    }),
  });

  if (response.status !== 200) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Transaction creation failed: ${response.statusText}`);
  }

  const data = await response.arrayBuffer();
  return VersionedTransaction.deserialize(new Uint8Array(data));
}

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
      pool: "pump",
    }),
  });

  if (response.status !== 200) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Trade transaction failed: ${response.statusText}`);
  }

  const data = await response.arrayBuffer();
  return VersionedTransaction.deserialize(new Uint8Array(data));
}

export async function sendAndConfirmTx(
  signedTx: VersionedTransaction
): Promise<string> {
  const connection = getConnection();
  const signature = await connection.sendTransaction(signedTx);
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
}
