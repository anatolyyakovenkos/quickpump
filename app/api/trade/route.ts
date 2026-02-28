import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.publicKey) {
      return NextResponse.json({ error: "Missing publicKey" }, { status: 400 });
    }
    if (!body.action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      // Try to read the error body as text
      const text = await response.text();
      console.error("[trade] PumpPortal error:", response.status, text);

      // Try to parse as JSON for a cleaner error
      let errorMsg = `PumpPortal API error (${response.status})`;
      try {
        const parsed = JSON.parse(text);
        if (parsed.error || parsed.message) {
          errorMsg = parsed.error || parsed.message;
        }
      } catch {
        if (text.length > 0 && text.length < 500) {
          errorMsg = text;
        }
      }

      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    // Validate we got binary transaction data back, not an error page
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html") || contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[trade] Unexpected response type:", contentType, text);
      return NextResponse.json(
        { error: "PumpPortal returned unexpected response format" },
        { status: 502 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "PumpPortal returned empty transaction" },
        { status: 502 }
      );
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Trade request failed";
    console.error("[trade] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
