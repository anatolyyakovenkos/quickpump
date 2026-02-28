export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Server-side RPC for sending transactions (avoids public RPC 403 on sendTransaction)
export const SOLANA_RPC_URL_SERVER =
  process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "mainnet-beta" | "devnet") || "mainnet-beta";

export const PUMPPORTAL_API_URL = "https://pumpportal.fun/api/trade-local";
export const PUMPFUN_IPFS_URL = "https://pump.fun/api/ipfs";
export const PUMPFUN_TOKEN_URL = "https://pump.fun/coin";

// bonk.fun (Raydium LaunchLab)
export const BONKFUN_IPFS_IMG_URL = "https://nft-storage.letsbonk22.workers.dev/upload/img";
export const BONKFUN_IPFS_META_URL = "https://nft-storage.letsbonk22.workers.dev/upload/meta";
export const BONKFUN_TOKEN_URL = "https://letsbonk.fun/token";

// Platform support
export type Platform = "pumpfun" | "bonkfun";

export function getTokenUrl(platform: Platform, mint: string): string {
  if (platform === "bonkfun") return `${BONKFUN_TOKEN_URL}/${mint}`;
  return `${PUMPFUN_TOKEN_URL}/${mint}`;
}

export function getPlatformName(platform: Platform): string {
  return platform === "bonkfun" ? "bonk.fun" : "pump.fun";
}
