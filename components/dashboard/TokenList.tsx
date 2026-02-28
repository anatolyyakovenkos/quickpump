"use client";

import { useEffect, useState } from "react";
import { useDeployer } from "@/components/providers/DeployerProvider";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUMPFUN_TOKEN_URL } from "@/lib/constants";

interface TokenInfo {
  mint: string;
  amount: number;
}

export default function TokenList() {
  const { publicKey } = useDeployer();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setTokens([]);
      return;
    }

    let cancelled = false;

    async function fetchTokens() {
      setLoading(true);
      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey!,
          { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
        );

        if (cancelled) return;

        const tokenList: TokenInfo[] = accounts.value
          .map((acc) => {
            const parsed = acc.account.data.parsed.info;
            return {
              mint: parsed.mint as string,
              amount: parsed.tokenAmount.uiAmount as number,
            };
          })
          .filter((t) => t.amount > 0);

        setTokens(tokenList);
      } catch {
        if (!cancelled) setTokens([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTokens();
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Generate a deployer wallet to view your tokens.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading tokens...
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No tokens found. Create one to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <Card key={token.mint} className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="font-mono text-sm truncate max-w-[180px]">
                {token.mint}
              </span>
              <Badge variant="secondary">{token.amount.toLocaleString()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={`${PUMPFUN_TOKEN_URL}/${token.mint}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="w-full">
                View on pump.fun
              </Button>
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
