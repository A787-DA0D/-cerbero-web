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

function toNumber(x: any): number | null {
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Unauthorized");
    const autopilotEnabled = false; // TEMP: no DB in this endpoint

    const COORD_URL = mustEnv("COORDINATOR_BASE_URL");
    // IMPORTANT: /v1/account/balance is INTERNAL
    const COORD_KEY =
      (process.env["COORDINATOR_INTERNAL_KEY"] || "").trim() ||
      mustEnv("COORDINATOR_API_KEY"); // fallback, ma meglio settare INTERNAL

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
        autopilotEnabled: autopilotEnabled,
        tradingAddress: data.resolved_address ?? data.smart_contract_address ?? null,
        balanceUSDC: toNumber(data.balance_usdc ?? data.balanceUSDC),
        source: data.source ?? "coordinator",
      },
      { status: 200 }
    );
  } catch (e: any) {
    const msg = (e?.message || "Server error").toString();
    return jsonError(500, msg);
  }
}
