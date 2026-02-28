export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "mainnet-beta" | "devnet") || "mainnet-beta";

export const PUMPPORTAL_API_URL = "https://pumpportal.fun/api/trade-local";
export const PUMPFUN_IPFS_URL = "https://pump.fun/api/ipfs";
export const PUMPFUN_TOKEN_URL = "https://pump.fun/coin";
