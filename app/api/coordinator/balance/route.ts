// app/api/coordinator/balance/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getBearerSession } from "@/lib/bearer-session";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function mustEnv(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`${name} missing`);
  return v;
}

export async function GET(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Unauthorized");

    const COORD_URL = mustEnv("COORDINATOR_BASE_URL");
    const COORD_KEY = mustEnv("COORDINATOR_API_KEY");

    const url = new URL("/v1/account/balance", COORD_URL);
    url.searchParams.set("user_id", email);

    const r = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": COORD_KEY,
      },
      cache: "no-store",
    });

    const data = await r.json().catch(() => null);

    if (!r.ok || !data?.ok) {
      return NextResponse.json(
        { ok: false, error: data?.detail || data?.error || "Coordinator error" },
        { status: r.status || 502 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        tradingAddress: data.resolved_address ?? null,
        balanceUSDC: typeof data.balance_usdc === "number" ? data.balance_usdc : null,
        source: data.source ?? "coordinator",
      },
      { status: 200 }
    );
  } catch (e: any) {
    const msg = (e?.message || "Server error").toString();
    return jsonError(500, msg);
  }
}
