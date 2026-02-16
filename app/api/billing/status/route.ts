import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(_req: NextRequest) {
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

  const base = COORDINATOR_BASE_URL.replace(/\/$/, "");
  const url = `${base}/v1/billing/status?email=${encodeURIComponent(email)}`;

  const r = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": COORDINATOR_API_KEY,
    },
    cache: "no-store",
  });

  const txt = await r.text();
  return new NextResponse(txt, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
