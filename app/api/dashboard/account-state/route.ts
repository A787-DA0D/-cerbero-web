import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {

    const session = await getServerSession(authOptions);
    const suser = (session as unknown as { user?: { email?: unknown } } | null)?.user;
    const rawEmail = suser?.email;
    const email = (typeof rawEmail === 'string' ? rawEmail : undefined);

    if (!email) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const q = `
      SELECT
        t.id as tenant_id,
        t.autopilot_enabled,
        t.aggressiveness,
        ca.provider,
        ca.metaapi_platform,
        ca.status as cefi_status,
        s.balance,
        s.equity,
        s.margin_used,
        s.free_margin,
        s.currency,
        s.updated_at
      FROM tenants t
      LEFT JOIN cefi_accounts ca ON ca.tenant_id = t.id
      LEFT JOIN cefi_account_state s ON s.tenant_id = t.id
      WHERE t.email = $1
      LIMIT 1
    `;

    const r = await db.query(q, [email]);
    if (!r?.rowCount) {
      return NextResponse.json({ ok: false, error: 'TENANT_NOT_FOUND' }, { status: 404 });
    }

    const row = r.rows[0];

    // count posizioni LIVE (OPEN) dal DB
    const c = await db.query(
      "SELECT count(*)::int AS n FROM positions WHERE tenant_id = $1 AND status = 'OPEN'",
      [row.tenant_id]
    );
    const openTrades = c.rows?.[0]?.n ?? 0;


    return NextResponse.json({
      ok: true,
      tenant: { id: row.tenant_id, email },
      autopilot: { enabled: Boolean(row.autopilot_enabled) },
      aggressiveness: (row.aggressiveness ?? 'NORMAL'),
      open_trades: openTrades,
      broker: {
        provider: row.provider ?? null,
        platform: row.metaapi_platform ?? null,
        status: row.cefi_status ?? null,
      },
      account: {
        balance: row.balance !== null ? Number(row.balance) : null,
        equity: row.equity !== null ? Number(row.equity) : null,
        margin_used: row.margin_used !== null ? Number(row.margin_used) : null,
        free_margin: row.free_margin !== null ? Number(row.free_margin) : null,
        currency: row.currency ?? null,
        updated_at: row.updated_at ?? null,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR', message: String(e instanceof Error ? e.message : e) },
      { status: 500 }
    );
  }
}
