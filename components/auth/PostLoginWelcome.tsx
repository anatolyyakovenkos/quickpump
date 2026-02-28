"use client";

import Link from "next/link";
import { useDeployer } from "@/components/providers/DeployerProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PostLoginWelcome() {
  const { publicKey, balance, exportKey } = useDeployer();

  function handleCopyAddress() {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      toast.success("Address copied to clipboard");
    }
  }

  function handleExportKey() {
    const key = exportKey();
    if (key) {
      navigator.clipboard.writeText(key);
      toast.success("Private key copied to clipboard");
    }
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-2xl space-y-8">
        {/* Deployer Wallet Info */}
        <Card className="border-green-500/20 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Your Deployer Wallet
              {balance !== null && (
                <Badge variant="secondary">{balance.toFixed(4)} SOL</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {publicKey ? (
              <>
                <div
                  className="font-mono text-sm break-all bg-muted/50 rounded-md p-3 cursor-pointer hover:bg-muted transition-colors"
                  onClick={handleCopyAddress}
                  title="Click to copy"
                >
                  {publicKey.toBase58()}
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" onClick={handleCopyAddress}>
                    Copy Address
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportKey}>
                    Export Private Key
                  </Button>
                </div>
                {balance !== null && balance < 0.01 && (
                  <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                    Your wallet balance is low. Deposit SOL to the address above to create tokens and trade.
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading wallet...</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/create">
            <Card className="border-green-500/20 bg-card/50 hover:border-green-500/40 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">Create Token</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Launch a new token on pump.fun or bonk.fun with custom name, symbol, and image.
              </CardContent>
            </Card>
          </Link>
          <Link href="/trade">
            <Card className="border-green-500/20 bg-card/50 hover:border-green-500/40 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">Trade</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Buy and sell tokens on pump.fun or bonk.fun with configurable slippage.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
