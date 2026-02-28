"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { shortenAddress } from "@/lib/solana";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    async function fetchBalance() {
      try {
        const bal = await connection.getBalance(publicKey!);
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
  }, [publicKey, connection]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-green-500">Quick</span>Pump
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/create"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Create
            </Link>
            <Link
              href="/trade"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Trade
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {publicKey && balance !== null && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {balance.toFixed(3)} SOL
            </Badge>
          )}
          {publicKey && (
            <Badge variant="outline" className="hidden sm:inline-flex font-mono text-xs">
              {shortenAddress(publicKey.toBase58())}
            </Badge>
          )}
          <WalletMultiButton
            style={{
              backgroundColor: "hsl(142, 71%, 45%)",
              height: "2.25rem",
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
            }}
          />
        </div>
      </div>
    </nav>
  );
}
