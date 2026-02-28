"use client";

import { type ReactNode } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { SOLANA_RPC_URL } from "@/lib/constants";
import DeployerProvider from "./DeployerProvider";

export default function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL}>
      <DeployerProvider>{children}</DeployerProvider>
    </ConnectionProvider>
  );
}
