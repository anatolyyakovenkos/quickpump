"use client";

import { useEffect, useState } from "react";
import { useDeployer } from "@/components/providers/DeployerProvider";
import { useConnection } from "@solana/wallet-adapter-react";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TxHistory() {
  const { publicKey } = useDeployer();
  const { connection } = useConnection();
  const [txns, setTxns] = useState<ConfirmedSignatureInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setTxns([]);
      return;
    }

    let cancelled = false;

    async function fetchTxns() {
      setLoading(true);
      try {
        const sigs = await connection.getSignaturesForAddress(publicKey!, {
          limit: 20,
        });
        if (!cancelled) setTxns(sigs);
      } catch {
        if (!cancelled) setTxns([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTxns();
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  if (!publicKey) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : txns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent transactions.</p>
        ) : (
          <div className="space-y-3">
            {txns.map((tx) => (
              <div
                key={tx.signature}
                className="flex items-center justify-between rounded-lg border border-border/50 p-3"
              >
                <div className="flex flex-col gap-1">
                  <a
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-green-500 hover:underline"
                  >
                    {tx.signature.slice(0, 16)}...
                  </a>
                  {tx.blockTime && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(tx.blockTime * 1000).toLocaleString()}
                    </span>
                  )}
                </div>
                <Badge variant={tx.err ? "destructive" : "secondary"}>
                  {tx.err ? "Failed" : "Success"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
