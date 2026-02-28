"use client";

import { useState, useRef } from "react";
import { useDeployer } from "@/components/providers/DeployerProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PlatformToggle from "@/components/ui/platform-toggle";
import { uploadToIPFS, createToken, sendSignedTransaction } from "@/lib/pumpfun";
import { getTokenUrl, getPlatformName, type Platform } from "@/lib/constants";

export default function CreateTokenForm() {
  const { keypair, publicKey, generate } = useDeployer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [createdMint, setCreatedMint] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("pumpfun");

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    initialBuy: "0",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!keypair || !publicKey) {
      toast.error("Generate a deployer wallet first");
      return;
    }
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }
    if (!form.name.trim() || !form.symbol.trim()) {
      toast.error("Name and symbol are required");
      return;
    }

    const initialBuy = parseFloat(form.initialBuy) || 0;
    const platformName = getPlatformName(platform);

    setLoading(true);
    try {
      // Step 1: Upload metadata to IPFS
      setStep("Uploading metadata to IPFS...");
      toast.info(`Uploading metadata via ${platformName}...`);
      const metadataUri = await uploadToIPFS(
        {
          name: form.name.trim(),
          symbol: form.symbol.trim().toUpperCase(),
          description: form.description.trim(),
          twitter: form.twitter.trim() || undefined,
          telegram: form.telegram.trim() || undefined,
          website: form.website.trim() || undefined,
        },
        imageFile,
        platform
      );

      // Step 2: Build create transaction (with dev buy included)
      setStep("Building transaction...");
      toast.info("Building transaction...");
      const result = await createToken(
        publicKey.toBase58(),
        form.name.trim(),
        form.symbol.trim().toUpperCase(),
        metadataUri,
        initialBuy,
        platform
      );

      // Step 3: Sign with mint keypair + deployer keypair — instant, no popup
      setStep("Signing transaction...");
      result.transaction.sign([result.mintKeypair, keypair]);

      // Step 4: Send transaction
      setStep("Sending transaction...");
      toast.info("Sending transaction...");
      await sendSignedTransaction(result.transaction);

      setCreatedMint(result.mint);
      toast.success("Token launched successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Token creation failed";
      toast.error(message);
    } finally {
      setLoading(false);
      setStep("");
    }
  }

  if (createdMint) {
    const platformName = getPlatformName(platform);
    const tokenUrl = getTokenUrl(platform, createdMint);

    return (
      <Card className="mx-auto max-w-lg border-green-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-500">Token Created!</CardTitle>
          <CardDescription>Your token is now live on {platformName}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="font-mono text-sm break-all text-center text-muted-foreground">
            {createdMint}
          </p>
          <div className="flex gap-3">
            <a
              href={tokenUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                View on {platformName}
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedMint(null);
                setForm({
                  name: "",
                  symbol: "",
                  description: "",
                  twitter: "",
                  telegram: "",
                  website: "",
                  initialBuy: "0",
                });
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              Create Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Create a Token</CardTitle>
          <CardDescription>
            Fill in the details below to launch your token
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Platform selection */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <PlatformToggle value={platform} onChange={setPlatform} disabled={loading} />
          </div>

          {/* Token basics */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name *</Label>
              <Input
                id="name"
                placeholder="e.g. QuickPump Token"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g. QPUMP"
                value={form.symbol}
                onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
                maxLength={10}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your token..."
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Token Image *</Label>
            <div
              className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-green-500/50 ${loading ? "pointer-events-none opacity-50" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Token preview"
                  className="h-32 w-32 rounded-lg object-cover"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload an image (max 5MB)
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Socials */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                placeholder="@handle"
                value={form.twitter}
                onChange={(e) => updateField("twitter", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                placeholder="t.me/group"
                value={form.telegram}
                onChange={(e) => updateField("telegram", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://..."
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Initial buy */}
          <div className="space-y-2">
            <Label htmlFor="initialBuy">Initial Dev Buy (SOL)</Label>
            <Input
              id="initialBuy"
              type="number"
              step="0.001"
              min="0"
              placeholder="0"
              value={form.initialBuy}
              onChange={(e) => updateField("initialBuy", e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              0 = no dev buy. Amount of SOL to buy your own token with at launch.
            </p>
          </div>

          {!publicKey ? (
            <Button
              type="button"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={generate}
            >
              Generate Wallet to Create
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? step || "Creating..." : "Create Token"}
            </Button>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
