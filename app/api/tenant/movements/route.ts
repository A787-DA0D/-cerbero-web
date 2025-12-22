import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Unauthorized");

    // 1) tenant id
    const resTenant = await db.query(
      `SELECT id FROM tenants WHERE email = $1 LIMIT 1;`,
      [email]
    );
    const tenantId = resTenant.rows[0]?.id as string | undefined;
    if (!tenantId) return jsonError(404, "Tenant not found");

    // 2) tenant_movements (schema reale: amount_usdc, metadata, tx_hash, ...)
    const res = await db.query(
      `
      SELECT
        id,
        type,
        amount_usdc,
        metadata,
        source,
        tx_hash,
        external_ref,
        chain,
        created_at
      FROM tenant_movements
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 100;
      `,
      [tenantId]
    );

    const movements = (res.rows || []).map((r: any) => ({
      id: r.id,
      type: r.type,
      amountUSDC: Number(r.amount_usdc) || 0,
      metadata: r.metadata ?? null,
      source: r.source ?? null,
      txHash: r.tx_hash ?? null,
      externalRef: r.external_ref ?? null,
      chain: r.chain ?? null,
      createdAt: r.created_at,
      // per UI “activity log”: label carina
      label:
        r.type === "deposit"
          ? "Deposito"
          : r.type === "withdraw"
          ? "Prelievo"
          : r.type === "trade"
          ? "Trade"
          : r.type,
    }));

    return NextResponse.json({ ok: true, movements }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/tenant/movements] error:", err);
    return jsonError(500, "Server error");
  }
}
