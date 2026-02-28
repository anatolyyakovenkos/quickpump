import TradePanel from "@/components/trade/TradePanel";

export const metadata = {
  title: "Trade — QuickPump",
};

export default function TradePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <TradePanel />
    </div>
  );
}
