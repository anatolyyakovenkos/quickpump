export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-green-500">Quick</span>Pump
            &mdash; Launch tokens on pump.fun
          </p>
          <div className="flex gap-6">
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              pump.fun
            </a>
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Solana
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
