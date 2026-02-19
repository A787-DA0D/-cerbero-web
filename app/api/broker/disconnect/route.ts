import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const suser = (session as unknown as { user?: { email?: unknown } } | null)?.user;
    const rawEmail = suser?.email;
    const email = (typeof rawEmail === "string" ? rawEmail : "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    // Ensure tenant exists (same pattern as connect)
    const tRes = await db.query("SELECT id FROM tenants WHERE lower(email)=lower($1) LIMIT 1;", [email]);
    if (!tRes.rowCount) {
      return NextResponse.json({ ok: false, error: "NOT_TENANT" }, { status: 403 });
    }
    const tenantId = String(tRes.rows[0].id);

    // Call coordinator disconnect (source-of-truth for rules + MetaApi check)
    const base = (process.env.COORDINATOR_BASE_URL || "").trim();
    const key = (process.env.COORDINATOR_INTERNAL_KEY || "").trim();

    if (!base || !key) {
      return NextResponse.json(
        { ok: false, code: !base ? "COORDINATOR_BASE_URL_MISSING" : "COORDINATOR_INTERNAL_KEY_MISSING", user_message: "Servizio non disponibile." },
        { status: 500 }
      );
    }

    const pr = await fetch(`${base}/v1/broker/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": key,
      },
      body: JSON.stringify({ email }),
    });

    const pj = await pr.json().catch(() => null);

    // Coordinator already returns top-level {ok,false,code,user_message}
    if (!pr.ok || !pj?.ok) {
      const code = pj?.code || pj?.detail?.code || pj?.error || `HTTP_${pr.status}`;
      const user_message =
        pj?.user_message ||
        pj?.detail?.user_message ||
        pj?.detail?.msg ||
        "Operazione non riuscita. Riprova.";

      return NextResponse.json({ ok: false, code, user_message }, { status: pr.status || 400 });
    }

    // Best-effort: update local DB to reflect detached state immediately.
    // (Coordinator is truth, but this keeps UI consistent without waiting refresh)
    await db.query(
      `
      UPDATE cefi_accounts
      SET status = 'detached',
          updated_at = now()
      WHERE tenant_id = $1 AND provider = 'metaapi';
      `,
      [tenantId]
    );

    return NextResponse.json({ ok: true, code: "BROKER_DISCONNECT_OK" }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, code: "SERVER_ERROR", user_message: String(e instanceof Error ? e.message : e) },
      { status: 500 }
    );
  }
}
