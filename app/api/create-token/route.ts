import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.publicKey) {
      return NextResponse.json({ error: "Missing publicKey" }, { status: 400 });
    }
    if (!body.name || !body.symbol || !body.uri) {
      return NextResponse.json({ error: "Missing name, symbol, or uri" }, { status: 400 });
    }

    const response = await fetch("https://pumpdev.io/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[create-token] PumpDev error:", response.status, text);
      let errorMsg = `Token creation failed (${response.status})`;
      try {
        const parsed = JSON.parse(text);
        if (parsed.error || parsed.message) {
          errorMsg = parsed.error || parsed.message;
        }
      } catch {
        if (text.length > 0 && text.length < 500) errorMsg = text;
      }
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Token creation failed";
    console.error("[create-token] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
