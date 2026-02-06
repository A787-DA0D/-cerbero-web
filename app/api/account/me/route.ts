// app/api/account/me/route.ts
// Cerbero: user/tenant "me" (CeFi-only, no DeFi fields)

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

async function fetchTenant(email: string) {
  const res = await db.query(
    `
    SELECT
      t.email,
      t.autopilot_enabled,
      t.subscription_status,
      t.current_period_end,
      t.plan_code,
      t.active_models,
      t.metaapi_account_id
    FROM tenants t
    WHERE lower(t.email) = lower($1)
    LIMIT 1;
    `,
    [email]
  );

  if (!res.rowCount) return null;

  const row = res.rows[0];
  return {
    email: (row.email as string) ?? email,
    autopilotEnabled: !!row.autopilot_enabled,
    subscriptionStatus: (row.subscription_status as string | null) ?? "inactive",
    currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end).toISOString() : null,
    planCode: (row.plan_code as string | null) ?? null,
    activeModels: row.active_models ?? [],
    metaapiAccountId: (row.metaapi_account_id as string | null) ?? null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = normalizeStr(session?.email).toLowerCase();
    if (!email) {
      return NextResponse.json(safeJson({ ok: false, error: "Must be authenticated!" }), { status: 401 });
    }

    const tenant = await fetchTenant(email);
    if (!tenant) {
      // Non creare tenant qui: lo crea Stripe webhook (o admin), qui solo read.
      return NextResponse.json(
        safeJson({ ok: false, error: "Tenant not found", email }),
        { status: 404 }
      );
    }

    return NextResponse.json(
      safeJson({
        ok: true,
        tenant,
      }),
      { status: 200 }
    );
  } catch (e: any) {
    const msg = (e?.shortMessage || e?.message || "Unknown error").toString();
    return NextResponse.json(safeJson({ ok: false, error: msg }), { status: 500 });
  }
}
