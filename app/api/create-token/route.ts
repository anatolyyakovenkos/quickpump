import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const t0 = Date.now();
    const body = await req.json();

    if (!body.publicKey) {
      return NextResponse.json({ error: "Missing publicKey" }, { status: 400 });
    }
    if (!body.name || !body.symbol || !body.uri) {
      return NextResponse.json({ error: "Missing name, symbol, or uri" }, { status: 400 });
    }

    const platform = body.platform || "pumpfun";

    // Strip platform from forwarded body
    const { platform: _platform, ...forwardBody } = body;

    let apiUrl: string;
    if (platform === "bonkfun") {
      // bonk.fun uses PumpPortal with pool: "launchlab"
      apiUrl = "https://pumpportal.fun/api/create";
      forwardBody.pool = "launchlab";
      console.log("[create-token] Requesting transaction from PumpPortal (LaunchLab)...");
    } else {
      // pump.fun uses PumpDev
      apiUrl = "https://pumpdev.io/api/create";
      console.log("[create-token] Requesting transaction from PumpDev...");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forwardBody),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[create-token] API error:", response.status, text);
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
    console.log(`[create-token] API responded in ${Date.now() - t0}ms, keys:`, Object.keys(data));
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Token creation failed";
    console.error("[create-token] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
