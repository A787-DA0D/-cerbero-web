import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function getFounderEmails(): Set<string> {
  const raw = (process.env.FOUNDER_EMAILS || "info@cerberoai.com").toLowerCase();
  return new Set(raw.split(",").map(s => s.trim()).filter(Boolean));
}

function isFounderEmail(email: string): boolean {
  return getFounderEmails().has((email || "").toLowerCase().trim());
}

function isSubscriptionActive(status: any): boolean {
  const s = (status || "").toString().toLowerCase();
  return s === "active" || s === "trialing";
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = (session?.user?.email || "").toString().toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const res = await db.query(
      `SELECT id, email, autopilot_enabled, subscription_status, current_period_end, plan_code, stripe_subscription_id, stripe_customer_id
       FROM tenants
       WHERE email = $1
       LIMIT 1;`,
      [email]
    );

    if (!res.rowCount) {
      return NextResponse.json({ ok: false, error: "NOT_TENANT" }, { status: 403 });
    }

    const row = res.rows[0] as any;

    return NextResponse.json({
      ok: true,
      profile: {
        email: row.email ?? email,
      },
      autopilot: {
        enabled: Boolean(row.autopilot_enabled),
      },
      subscription: (() => {
        const founder = isFounderEmail(email);
        const status = (row.subscription_status ?? null) as any;
        const active = founder || isSubscriptionActive(status);
        const periodEnd = row.current_period_end ? new Date(row.current_period_end).toISOString() : null;
        return {
          founder,
          active,
          status,
          currentPeriodEnd: periodEnd,
          planCode: row.plan_code ?? null,
          stripeSubscriptionId: row.stripe_subscription_id ?? null,
          stripeCustomerId: row.stripe_customer_id ?? null,
        };
      })(),
      broker: {
        connected: false,
        lastSyncAt: null,
      },
      account: {
        balance: null,
        equity: null,
        currency: "EUR",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
