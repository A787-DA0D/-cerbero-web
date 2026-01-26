// app/api/account/me/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

function safeJson(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

function normalizeStr(v: any) {
  return (v ?? "").toString().trim();
}

async function fetchTradingAddress(email: string): Promise<string | null> {
  const res = await db.query(
    `
    SELECT c.smart_contract_address
    FROM contracts c
    JOIN tenants t ON t.id = c.tenant_id
    WHERE t.email = $1
    ORDER BY c.created_at DESC NULLS LAST
    LIMIT 1;
    `,
    [email]
  );

  const addr = res.rowCount ? (res.rows[0].smart_contract_address as string | null) : null;
  return addr?.trim() || null;
}

export async function GET(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = normalizeStr(session?.email).toLowerCase();
    if (!email) {
      return NextResponse.json(safeJson({ ok: false, error: "Must be authenticated!" }), { status: 401 });
    }

    const tradingAddress = await fetchTradingAddress(email);

    return NextResponse.json(
      safeJson({
        ok: true,
        email,
        tradingAddress,
      }),
      { status: 200 }
    );
  } catch (e: any) {
    const msg = (e?.shortMessage || e?.message || "Unknown error").toString();
    return NextResponse.json(safeJson({ ok: false, error: msg }), { status: 500 });
  }
}
