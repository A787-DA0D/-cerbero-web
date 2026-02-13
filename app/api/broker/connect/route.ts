import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type Body = {
  provider?: "metaapi";
  platform?: "mt4" | "mt5";
  login?: string | null;
  server?: string | null;

  // NOTE: intentionally NOT storing password.
  // password?: string;

  // Optional: allow manual bind (for founder/dev)
  metaapi_account_id?: string | null;
};

function normStr(v: unknown): string | null {
  const s = (v ?? "").toString().trim();
  return s ? s : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const suser = (session as unknown as { user?: { email?: unknown } } | null)?.user;
    const rawEmail = suser?.email;
    const email = (typeof rawEmail === 'string' ? rawEmail : '').toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
    }

    const provider = "metaapi";
    const platform = (body.platform || "mt5") as "mt4" | "mt5";
    const region = "london";
    const login = normStr(body.login);
    const server = normStr(body.server);
    const password = normStr((body as unknown as { password?: unknown }).password);
    const metaapiAccountId = normStr(body.metaapi_account_id);

    // require at least platform; other fields can be provided later
    if (platform !== "mt4" && platform !== "mt5") {
      return NextResponse.json({ ok: false, error: "BAD_PLATFORM" }, { status: 400 });
    }

    // get tenant id
    const tRes = await db.query(
      "SELECT id FROM tenants WHERE lower(email)=lower($1) LIMIT 1;",
      [email]
    );
    if (!tRes.rowCount) {
      return NextResponse.json({ ok: false, error: "NOT_TENANT" }, { status: 403 });
    }
    const tenantId = String(tRes.rows[0].id);

    // Upsert cefi_accounts (provider=metaapi)
    // status: pending (istituzionale: onboarding in corso)
    const newId = crypto.randomUUID();
    const up = await db.query(
      `
      INSERT INTO cefi_accounts
        (id, tenant_id, provider, metaapi_platform, metaapi_region, metaapi_login, metaapi_server, metaapi_account_id, status)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      ON CONFLICT (tenant_id, provider) DO UPDATE
        SET metaapi_platform = EXCLUDED.metaapi_platform,
            metaapi_region = EXCLUDED.metaapi_region,
            metaapi_login = EXCLUDED.metaapi_login,
            metaapi_server = EXCLUDED.metaapi_server,
            metaapi_account_id = COALESCE(EXCLUDED.metaapi_account_id, cefi_accounts.metaapi_account_id),
            status = 'pending',
            updated_at = now()
      RETURNING id, tenant_id, provider, metaapi_platform, metaapi_region, metaapi_login, metaapi_server, metaapi_account_id, status, created_at, updated_at;
      `,
      [newId, tenantId, provider, platform, region, login, server, metaapiAccountId]
    );
    // --- notify coordinator to provision broker (SYNC) ---
    let provisionOk: boolean | null = null;
    let provisionError: string | null = null;

    try {
      const base = (process.env.COORDINATOR_BASE_URL || "").trim();
      const key = (process.env.COORDINATOR_INTERNAL_KEY || "").trim();

      if (!base || !key) {
        provisionOk = false;
        provisionError = !base
          ? "COORDINATOR_BASE_URL_MISSING"
          : "COORDINATOR_INTERNAL_KEY_MISSING";
      } else {
        const pr = await fetch(`${base}/v1/broker/provision`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Key": key,
          },
          body: JSON.stringify({
            email,
            provider: "metaapi",
            platform,
            login,
            password,
            server,
          }),
        });

        const pj = await pr.json().catch(() => null);

        const provisionActivated =
          !!(pj && (pj.activated > 0 || (pj.results && pj.results[0] && pj.results[0].ok)));

        if (!pr.ok || !pj?.ok || !provisionActivated) {
          provisionOk = false;
          provisionError =
            (pj && (pj.detail?.code || pj.detail?.msg || pj.detail?.error || pj.error)) ||
            (pj && pj.results && pj.results[0] && (pj.results[0].code || pj.results[0].message)) ||
            `HTTP_${pr.status}`;
        } else {
          provisionOk = true;
        }
      }
    } catch (e: unknown) {
      provisionOk = false;
      provisionError = String(e instanceof Error ? e.message : e);
    }

    // If provisioning succeeded, mark broker active. Otherwise mark error with last_error.
    const hasAccountId = !!normStr((up.rows?.[0]?.metaapi_account_id ?? null) as unknown);
    // Stato "active" SOLO se provisionOk e abbiamo metaapi_account_id valorizzato
    const nextStatus = (provisionOk && hasAccountId) ? "active" : "pending";
    const nextErr = (provisionOk && hasAccountId) ? null : (provisionError || null);

    const up2 = await db.query(
      `
      UPDATE cefi_accounts
      SET status = $1,
          last_error = $2,
          updated_at = now()
      WHERE id = $3
      RETURNING id, tenant_id, provider, metaapi_platform, metaapi_region, metaapi_login, metaapi_server, metaapi_account_id, status, last_error, created_at, updated_at;
      `,
      [nextStatus, nextErr, up.rows[0].id]
    );
    return NextResponse.json(
      {
        ok: true,
        broker: up2.rows[0],
        note:
          "Saved broker connection request (pending). Next step: Coordinator provisioning/bind + first sync.",
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: String(e instanceof Error ? e.message : e) },
      { status: 500 }
    );
  }
}
