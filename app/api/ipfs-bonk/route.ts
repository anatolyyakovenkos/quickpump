import { NextRequest, NextResponse } from "next/server";
import { BONKFUN_IPFS_IMG_URL, BONKFUN_IPFS_META_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const t0 = Date.now();
    const formData = await req.formData();

    const file = formData.get("file") as Blob | null;
    const name = formData.get("name") as string;
    const symbol = formData.get("symbol") as string;
    const description = formData.get("description") as string;
    const twitter = formData.get("twitter") as string | null;
    const telegram = formData.get("telegram") as string | null;
    const website = formData.get("website") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }
    if (!name || !symbol) {
      return NextResponse.json({ error: "Missing name or symbol" }, { status: 400 });
    }

    // Step 1: Upload image
    console.log("[IPFS-BONK] Uploading image to bonk.fun storage...");
    const imgForm = new FormData();
    imgForm.append("file", file);

    const imgResponse = await fetch(BONKFUN_IPFS_IMG_URL, {
      method: "POST",
      body: imgForm,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    const t1 = Date.now();
    console.log(`[IPFS-BONK] Image upload responded ${imgResponse.status} in ${t1 - t0}ms`);

    if (!imgResponse.ok) {
      const text = await imgResponse.text();
      console.error("[IPFS-BONK] Image upload failed:", imgResponse.status, text);
      return NextResponse.json(
        { error: `Image upload failed (${imgResponse.status}): ${text}` },
        { status: imgResponse.status }
      );
    }

    const imgData = await imgResponse.json();
    console.log("[IPFS-BONK] Image response keys:", Object.keys(imgData), imgData);

    // Extract image URI — try common response shapes
    const imageUri = imgData.uri || imgData.url || imgData.image || imgData.cid;
    if (!imageUri) {
      console.error("[IPFS-BONK] Unexpected image response:", imgData);
      return NextResponse.json(
        { error: "Image upload succeeded but no URI returned. Check server logs." },
        { status: 502 }
      );
    }

    // Step 2: Upload metadata JSON
    console.log("[IPFS-BONK] Uploading metadata to bonk.fun storage...");
    const metadata: Record<string, unknown> = {
      name,
      symbol,
      description: description || "",
      image: imageUri,
    };
    if (twitter) metadata.twitter = twitter;
    if (telegram) metadata.telegram = telegram;
    if (website) metadata.website = website;

    const metaResponse = await fetch(BONKFUN_IPFS_META_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      body: JSON.stringify(metadata),
    });

    const t2 = Date.now();
    console.log(`[IPFS-BONK] Metadata upload responded ${metaResponse.status} in ${t2 - t1}ms`);

    if (!metaResponse.ok) {
      const text = await metaResponse.text();
      console.error("[IPFS-BONK] Metadata upload failed:", metaResponse.status, text);
      return NextResponse.json(
        { error: `Metadata upload failed (${metaResponse.status}): ${text}` },
        { status: metaResponse.status }
      );
    }

    const metaData = await metaResponse.json();
    console.log("[IPFS-BONK] Metadata response keys:", Object.keys(metaData), metaData);

    // Extract metadata URI — try common response shapes
    const metadataUri = metaData.metadataUri || metaData.uri || metaData.url || metaData.metadata;
    if (!metadataUri) {
      console.error("[IPFS-BONK] Unexpected metadata response:", metaData);
      return NextResponse.json(
        { error: "Metadata upload succeeded but no URI returned. Check server logs." },
        { status: 502 }
      );
    }

    console.log(`[IPFS-BONK] Total: ${t2 - t0}ms, metadataUri: ${metadataUri}`);
    return NextResponse.json({ metadataUri });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "IPFS upload failed";
    console.error("[IPFS-BONK] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
