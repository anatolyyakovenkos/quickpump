"use client";

import { useState } from "react";
import { useDeployer } from "@/components/providers/DeployerProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tradeTransaction, sendSignedTransaction } from "@/lib/pumpfun";

export default function TradePanel() {
  const { keypair, publicKey, generate } = useDeployer();
  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState("");
  const [buyAmount, setBuyAmount] = useState("0.1");
  const [sellPercent, setSellPercent] = useState("100");
  const [lastTx, setLastTx] = useState<string | null>(null);

  async function handleTrade(action: "buy" | "sell") {
    if (!keypair || !publicKey) {
      toast.error("Generate a deployer wallet first");
      return;
    }
    if (!mintAddress) {
      toast.error("Enter a token contract address");
      return;
    }

    setLoading(true);
    try {
      toast.info(`Building ${action} transaction...`);

      const isBuy = action === "buy";
      const tx = await tradeTransaction(publicKey.toBase58(), {
        action,
        mint: mintAddress,
        amount: isBuy
          ? parseFloat(buyAmount) || 0
          : `${parseFloat(sellPercent) || 100}%`,
        slippage: 100,
        denominatedInSol: isBuy,
        priorityFee: 0,
      });

      // Sign with deployer keypair — instant, no popup
      tx.sign([keypair]);
      toast.info("Sending transaction...");
      const signature = await sendSignedTransaction(tx);
      setLastTx(signature);
      toast.success(`${isBuy ? "Buy" : "Sell"} successful!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Trade Tokens</CardTitle>
        <CardDescription>Buy or sell any pump.fun token</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="mint">Token Contract Address</Label>
          <Input
            id="mint"
            placeholder="Enter mint address..."
            className="font-mono text-sm"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value.trim())}
          />
        </div>

        <Tabs defaultValue="buy">
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="grid gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="buy-amount">Amount (SOL)</Label>
              <Input
                id="buy-amount"
                type="number"
                step="0.01"
                min="0.001"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
              />
            </div>
            {!publicKey ? (
              <Button
                type="button"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={generate}
              >
                Generate Wallet
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
                onClick={() => handleTrade("buy")}
              >
                {loading ? "Processing..." : "Buy"}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="sell" className="grid gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="sell-percent">Sell Percentage (%)</Label>
              <div className="flex gap-2">
                <Input
                  id="sell-percent"
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={sellPercent}
                  onChange={(e) => setSellPercent(e.target.value)}
                />
                <div className="flex gap-1">
                  {["25", "50", "100"].map((pct) => (
                    <Button
                      key={pct}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`text-xs ${sellPercent === pct ? "border-green-500 text-green-500" : ""}`}
                      onClick={() => setSellPercent(pct)}
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {!publicKey ? (
              <Button
                type="button"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={generate}
              >
                Generate Wallet
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
                onClick={() => handleTrade("sell")}
              >
                {loading ? "Processing..." : "Sell"}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        {lastTx && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">Last Tx</Badge>
            <a
              href={`https://solscan.io/tx/${lastTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-green-500 hover:underline truncate"
            >
              {lastTx}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
