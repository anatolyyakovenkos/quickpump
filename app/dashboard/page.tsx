import TokenList from "@/components/dashboard/TokenList";
import TxHistory from "@/components/dashboard/TxHistory";

export const metadata = {
  title: "Dashboard — QuickPump",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          View your tokens and recent transactions.
        </p>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Your Tokens</h2>
          <TokenList />
        </section>

        <section>
          <TxHistory />
        </section>
      </div>
    </div>
  );
}
