import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/20 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Launch tokens on{" "}
            <span className="text-green-500">pump.fun</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Create, trade, and manage Solana tokens in seconds. Connect your
            wallet, fill out the form, and launch — it&apos;s that easy.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/create">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-base px-8">
                Launch a Token
              </Button>
            </Link>
            <Link href="/trade">
              <Button size="lg" variant="outline" className="text-base px-8">
                Start Trading
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-green-500/20 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span> Create
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Fill in your token details, upload an image, and deploy to
              pump.fun in one click.
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span> Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Buy and sell any pump.fun token directly from QuickPump with
              configurable slippage.
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span> Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              View all tokens you&apos;ve created, track transaction history,
              and manage your portfolio.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500 font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold">Connect Wallet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Link your Phantom or Solflare wallet to get started.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500 font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold">Configure Token</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Set your token name, symbol, description, and upload an image.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500 font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold">Launch</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign the transaction and your token is live on pump.fun!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
