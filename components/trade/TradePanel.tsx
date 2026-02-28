"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
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
import { tradeTransaction, sendAndConfirmTx } from "@/lib/pumpfun";

export default function TradePanel() {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [slippage, setSlippage] = useState("10");
  const [priorityFee, setPriorityFee] = useState("0.0005");
  const [lastTx, setLastTx] = useState<string | null>(null);

  async function handleTrade(action: "buy" | "sell") {
    if (!publicKey || !signTransaction) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!mintAddress) {
      toast.error("Enter a token contract address");
      return;
    }

    setLoading(true);
    try {
      toast.info(`Building ${action} transaction...`);
      const tx = await tradeTransaction(publicKey.toBase58(), {
        action,
        mint: mintAddress,
        amount: parseFloat(amount) || 0,
        slippage: parseFloat(slippage) || 10,
        denominatedInSol: true,
        priorityFee: parseFloat(priorityFee) || 0.0005,
      });

      const signedTx = await signTransaction(tx);
      toast.info("Sending transaction...");
      const signature = await sendAndConfirmTx(signedTx);
      setLastTx(signature);
      toast.success(`${action === "buy" ? "Buy" : "Sell"} successful!`);
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
            onChange={(e) => setMintAddress(e.target.value)}
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
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buy-slippage">Slippage (%)</Label>
                <Input
                  id="buy-slippage"
                  type="number"
                  step="1"
                  min="1"
                  max="50"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy-fee">Priority Fee</Label>
                <Input
                  id="buy-fee"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={priorityFee}
                  onChange={(e) => setPriorityFee(e.target.value)}
                />
              </div>
            </div>
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading || !publicKey}
              onClick={() => handleTrade("buy")}
            >
              {loading ? "Processing..." : !publicKey ? "Connect Wallet" : "Buy"}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="grid gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount (SOL)</Label>
              <Input
                id="sell-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sell-slippage">Slippage (%)</Label>
                <Input
                  id="sell-slippage"
                  type="number"
                  step="1"
                  min="1"
                  max="50"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell-fee">Priority Fee</Label>
                <Input
                  id="sell-fee"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={priorityFee}
                  onChange={(e) => setPriorityFee(e.target.value)}
                />
              </div>
            </div>
            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading || !publicKey}
              onClick={() => handleTrade("sell")}
            >
              {loading ? "Processing..." : !publicKey ? "Connect Wallet" : "Sell"}
            </Button>
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
