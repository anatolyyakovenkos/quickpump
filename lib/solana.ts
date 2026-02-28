import { Connection } from "@solana/web3.js";
import { SOLANA_RPC_URL } from "./constants";

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(SOLANA_RPC_URL, "confirmed");
  }
  return connection;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function getBalance(address: string): Promise<number> {
  const conn = getConnection();
  const balance = await conn.getBalance(
    new (await import("@solana/web3.js")).PublicKey(address)
  );
  return balance / 1e9; // Convert lamports to SOL
}
