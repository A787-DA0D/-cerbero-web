import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const COORDINATOR_BASE_URL = process.env.COORDINATOR_BASE_URL || "";
  const COORDINATOR_API_KEY = process.env.COORDINATOR_API_KEY || "";

  if (!COORDINATOR_BASE_URL || !COORDINATOR_API_KEY) {
    return NextResponse.json({ ok: false, error: "BILLING_NOT_CONFIGURED" }, { status: 500 });
  }

  const body = await req.json();
  const origin = req.headers.get("origin") || "";
  const email = String((body as any)?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: "MISSING_EMAIL" }, { status: 400 });
  }
  const success_url = `${origin}/login?email=${encodeURIComponent(email)}`;
  const cancel_url = `${origin}/signup`;
  const payload = { email, success_url, cancel_url };


  const r = await fetch(
    `${COORDINATOR_BASE_URL.replace(/\/$/, "")}/v1/billing/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": COORDINATOR_API_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  const dataText = await r.text();
  return new NextResponse(dataText, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
