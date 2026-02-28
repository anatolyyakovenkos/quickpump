import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Rebuild FormData to ensure clean forwarding
    const outgoing = new FormData();
    for (const [key, value] of formData.entries()) {
      outgoing.append(key, value);
    }

    const response = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: outgoing,
      headers: {
        // Mimic browser request to avoid server-side blocking
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[IPFS] Upload failed:", response.status, text);
      return NextResponse.json(
        { error: `IPFS upload failed (${response.status}): ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // pump.fun returns { metadataUri: "..." } — validate we got it
    if (!data.metadataUri) {
      console.error("[IPFS] Unexpected response:", data);
      return NextResponse.json(
        { error: "IPFS upload succeeded but no metadataUri returned" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "IPFS upload failed";
    console.error("[IPFS] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
