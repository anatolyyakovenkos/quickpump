"use client";

import Link from "next/link";
import { useState } from "react";
import { useDeployer } from "@/components/providers/DeployerProvider";
import { shortenAddress } from "@/lib/solana";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Navbar() {
  const { publicKey, balance, generate, clear, exportKey } = useDeployer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const navLinks = [
    { href: "/create", label: "Create" },
    { href: "/trade", label: "Trade" },
    { href: "/dashboard", label: "Dashboard" },
  ];

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
    setShowMenu(false);
  }

  function handleReset() {
    if (confirm("This will delete your deployer wallet. Make sure you have exported the private key. Continue?")) {
      clear();
      toast.info("Deployer wallet removed");
    }
    setShowMenu(false);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-green-500">Quick</span>Pump
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {publicKey ? (
            <>
              {balance !== null && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {balance.toFixed(3)} SOL
                </Badge>
              )}
              <Badge
                variant="outline"
                className="hidden sm:inline-flex font-mono text-xs cursor-pointer"
                onClick={handleCopyAddress}
                title="Click to copy address"
              >
                {shortenAddress(publicKey.toBase58())}
              </Badge>
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  Wallet
                </Button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-background shadow-lg z-50">
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                      onClick={handleCopyAddress}
                    >
                      Copy Address
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                      onClick={handleExportKey}
                    >
                      Export Private Key
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-muted"
                      onClick={handleReset}
                    >
                      Reset Wallet
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={generate}
            >
              Generate Wallet
            </Button>
          )}
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {publicKey && (
              <div className="mt-2 border-t border-border pt-2 px-3">
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {publicKey.toBase58()}
                </p>
                {balance !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Balance: {balance.toFixed(3)} SOL
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Fund this address with SOL to create tokens
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
