import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export const runtime = "nodejs";

/**
 * GET /api/dashboard/trades?scope=live|history&limit=50&offset=0
 * - live: posizioni OPEN
 * - history: posizioni CLOSED
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const email = (session as any)?.user?.email as string | undefined;
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const url = new URL(req.url);
    const scope = (url.searchParams.get("scope") || "live").toLowerCase();
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10), 1), 200);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);

    // risolvi tenant
    const t = await db.query(
      "SELECT id, email FROM tenants WHERE lower(email)=lower($1) LIMIT 1",
      [email]
    );
    if (!t.rowCount) {
      return NextResponse.json({ ok: false, error: "TENANT_NOT_FOUND" }, { status: 404 });
    }
    const tenantId = t.rows[0].id as string;

    const wantLive = scope === "live";

    const where = wantLive ? "status = 'OPEN'" : "status = 'CLOSED'";
    const order = wantLive ? "opened_at DESC NULLS LAST" : "closed_at DESC NULLS LAST";

    const rows = await db.query(
      `
      SELECT
        id,
        tenant_id,
        symbol,
        side,
        size_usdc,
        entry_price,
        status,
        opened_at,
        closed_at,
        pnl_realized,
        provider_account_id,
        provider_position_id,
        provider_order_id,
        close_reason,
        updated_at
      FROM positions
      WHERE tenant_id = $1 AND ${where}
      ORDER BY ${order}
      LIMIT $2 OFFSET $3
      `,
      [tenantId, limit, offset]
    );

    const total = await db.query(
      `SELECT count(*)::int AS n FROM positions WHERE tenant_id=$1 AND ${where}`,
      [tenantId]
    );

    return NextResponse.json({
      ok: true,
      tenant: { id: tenantId, email },
      scope: wantLive ? "live" : "history",
      limit,
      offset,
      total: total.rows?.[0]?.n ?? 0,
      trades: rows.rows.map((r: any) => ({
        id: r.id,
        symbol: r.symbol,
        side: r.side,
        status: r.status,
        entry_price: r.entry_price !== null ? Number(r.entry_price) : null,
        size_usdc: r.size_usdc !== null ? Number(r.size_usdc) : null,
        pnl_realized: r.pnl_realized !== null ? Number(r.pnl_realized) : null,
        opened_at: r.opened_at ?? null,
        closed_at: r.closed_at ?? null,
        provider_position_id: r.provider_position_id ?? null,
        provider_order_id: r.provider_order_id ?? null,
        close_reason: r.close_reason ?? null,
        updated_at: r.updated_at ?? null,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
