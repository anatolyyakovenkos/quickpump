import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      const text = await response.text();
      return NextResponse.json(
        { error: `PumpPortal API failed: ${text}` },
        { status: response.status }
      );
    }

    // Return raw binary transaction data
    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Trade request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
