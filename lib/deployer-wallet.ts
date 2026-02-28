import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const STORAGE_KEY = "deployer-wallet-secret";

/**
 * Generate a new deployer keypair and persist to localStorage.
 */
export function generateWallet(): Keypair {
  const keypair = Keypair.generate();
  localStorage.setItem(STORAGE_KEY, bs58.encode(keypair.secretKey));
  return keypair;
}

/**
 * Load the deployer keypair from localStorage, or null if none exists.
 */
export function loadWallet(): Keypair | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return Keypair.fromSecretKey(bs58.decode(stored));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Return the bs58-encoded secret key string.
 */
export function exportPrivateKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Remove the deployer wallet from localStorage.
 */
export function clearWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
}
