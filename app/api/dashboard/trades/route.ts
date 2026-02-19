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
        p.id,
        p.tenant_id,
        p.symbol,
        p.side,
        p.size_usdc,
        p.entry_price,
        p.status,
        p.opened_at,
        p.closed_at,
        p.pnl_realized,
        p.provider_account_id,
        p.provider_position_id,
        p.provider_order_id,
        p.close_reason,
        p.updated_at,

        -- WHY (from latest matching execution)
        ex.reasons AS why_reasons,
        ex.strategy_origin AS why_strategy_origin,
        ex.strength AS why_strength
      FROM positions p
      LEFT JOIN LATERAL (
        SELECT
          (e.request_payload #> '{intent,meta,reasons}') AS reasons,
          (e.request_payload #>> '{intent,meta,strategy_origin}') AS strategy_origin,
          (e.request_payload #>> '{intent,meta,strength}') AS strength
        FROM executions e
        WHERE e.tenant_id = p.tenant_id
          AND (
            (p.provider_position_id IS NOT NULL AND e.provider_position_id = p.provider_position_id)
            OR
            (p.provider_order_id IS NOT NULL AND e.provider_order_id = p.provider_order_id)
          )
        ORDER BY e.created_at DESC
        LIMIT 1
      ) ex ON TRUE
      WHERE p.tenant_id = $1 AND ${where}
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
        why: {
          reasons: r.why_reasons ?? null,
          strategy_origin: r.why_strategy_origin ?? null,
          strength: r.why_strength ?? null,
        }
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
