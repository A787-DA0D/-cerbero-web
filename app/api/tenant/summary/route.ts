import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Unauthorized");

    // NB: query “tollerante”: prova a prendere trading address / balance / autopilot dalla tabella tenants
    const res = await db.query(
      `
      SELECT
        id,
        autopilot_enabled,
        smart_contract_address,
        balance_usdc
      FROM tenants
      WHERE email = $1
      LIMIT 1;
      `,
      [email]
    );

    const row = res.rows?.[0];
    if (!row?.id) return jsonError(404, "Tenant not found");

    // normalizzazioni
    const tradingAddress = (row.smart_contract_address || null) as string | null;

    // balance_usdc può essere numeric/string: normalizziamo a number
    let balanceUSDC: number | null = null;
    if (row.balance_usdc !== null && row.balance_usdc !== undefined) {
      const n = Number(row.balance_usdc);
      balanceUSDC = Number.isFinite(n) ? n : null;
    }

    const autopilotEnabled = !!row.autopilot_enabled;

    return NextResponse.json(
      {
        ok: true,
        email,
        tradingAddress,
        balanceUSDC,
        autopilotEnabled,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/tenant/summary] error:", err);
    return jsonError(500, "Server error");
  }
}
