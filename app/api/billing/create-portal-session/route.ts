import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: NextRequest) {
  const COORDINATOR_BASE_URL = process.env.COORDINATOR_BASE_URL || "";
  const COORDINATOR_API_KEY = process.env.COORDINATOR_API_KEY || "";

  if (!COORDINATOR_BASE_URL || !COORDINATOR_API_KEY) {
    return NextResponse.json({ ok: false, error: "BILLING_NOT_CONFIGURED" }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  const email = String(session?.user?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const origin = req.headers.get("origin") || "";
  const return_url = `${origin}/dashboard`;

  const base = COORDINATOR_BASE_URL.replace(/\/$/, "");
  const r = await fetch(`${base}/v1/billing/create-portal-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": COORDINATOR_API_KEY,
    },
    body: JSON.stringify({ email, return_url }),
  });

  const txt = await r.text();
  return new NextResponse(txt, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
