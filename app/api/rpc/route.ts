import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const upstream = process.env.ALCHEMY_HTTP_ARBITRUM || process.env.ARBITRUM_RPC_URL;
  if (!upstream) {
    return NextResponse.json({ error: "Missing ALCHEMY_HTTP_ARBITRUM" }, { status: 500 });
  }
  const body = await req.text();
  const r = await fetch(upstream, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
