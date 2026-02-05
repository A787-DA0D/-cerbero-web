import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = (session?.user?.email || "").toString().toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const res = await db.query(
      `SELECT id, email, autopilot_enabled
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
