"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  generateWallet,
  loadWallet,
  exportPrivateKey,
  clearWallet,
} from "@/lib/deployer-wallet";

interface DeployerContextValue {
  keypair: Keypair | null;
  publicKey: PublicKey | null;
  balance: number | null;
  generate: () => void;
  clear: () => void;
  exportKey: () => string | null;
}

const DeployerContext = createContext<DeployerContextValue>({
  keypair: null,
  publicKey: null,
  balance: null,
  generate: () => {},
  clear: () => {},
  exportKey: () => null,
});

export function useDeployer() {
  return useContext(DeployerContext);
}

export default function DeployerProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Load wallet from localStorage on mount
  useEffect(() => {
    setKeypair(loadWallet());
  }, []);

  // Poll balance every 15 seconds
  useEffect(() => {
    if (!keypair) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    async function fetchBalance() {
      try {
        const bal = await connection.getBalance(keypair!.publicKey);
        if (!cancelled) setBalance(bal / LAMPORTS_PER_SOL);
      } catch {
        if (!cancelled) setBalance(null);
      }
    }

    fetchBalance();
    const id = setInterval(fetchBalance, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [keypair, connection]);

  const generate = useCallback(() => {
    setKeypair(generateWallet());
  }, []);

  const clear = useCallback(() => {
    clearWallet();
    setKeypair(null);
    setBalance(null);
  }, []);

  const exportKey = useCallback(() => {
    return exportPrivateKey();
  }, []);

  return (
    <DeployerContext.Provider
      value={{
        keypair,
        publicKey: keypair?.publicKey ?? null,
        balance,
        generate,
        clear,
        exportKey,
      }}
    >
      {children}
    </DeployerContext.Provider>
  );
}
