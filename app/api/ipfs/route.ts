import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `IPFS upload failed: ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "IPFS upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
