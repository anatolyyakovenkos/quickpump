"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { publicKey, signMessage, disconnect, connected, select, connect, wallets } = useWallet();
  const { setVisible } = useWalletModal();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);

    // Find Phantom in available wallets
    const phantom = wallets.find((w) => w.adapter.name === "Phantom");
    if (!phantom) {
      setError("Phantom wallet not found. Please install the Phantom browser extension.");
      return;
    }

    try {
      select(phantom.adapter.name);
      await connect();
    } catch (err) {
      console.error("Connect failed:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  }

  async function handleSign() {
    if (!publicKey || !signMessage) return;

    setSigning(true);
    setError(null);
    try {
      const message = `Sign in to QuickPump\nTimestamp: ${Date.now()}`;
      const encoded = new TextEncoder().encode(message);
      const signature = await signMessage(encoded);

      const pubKeyBase64 = Buffer.from(publicKey.toBytes()).toString("base64");
      const sigBase64 = Buffer.from(signature).toString("base64");

      const result = await signIn("solana", {
        publicKey: pubKeyBase64,
        signature: sigBase64,
        message,
        redirect: false,
      });

      // Disconnect wallet adapter after login — we only needed it to sign
      await disconnect();

      if (result?.error) {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Signing failed:", err);
      setError("Signature rejected or failed.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-green-500">Quick</span>Pump
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Launch and trade tokens on pump.fun & bonk.fun
        </p>
      </div>

      <div className="grid gap-6 w-full max-w-md">
        <Card className="border-green-500/20 bg-card/50">
          <CardHeader>
            <CardTitle className="text-center text-lg">Sign in with Solana Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground text-center">
              Connect your Phantom wallet and sign a message to verify ownership.
            </p>
            {!connected ? (
              <>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleConnect}
                >
                  Connect Phantom
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setVisible(true)}
                >
                  Other Wallets
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleSign}
                disabled={signing}
              >
                {signing ? "Signing..." : "Sign Message to Login"}
              </Button>
            )}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
