import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type Body = {
  provider?: "metaapi";
  platform?: "mt4" | "mt5";
  region?: string | null;
  login?: string | null;
  server?: string | null;

  // NOTE: intentionally NOT storing password.
  // password?: string;

  // Optional: allow manual bind (for founder/dev)
  metaapi_account_id?: string | null;
};

function normStr(v: any): string | null {
  const s = (v ?? "").toString().trim();
  return s ? s : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    const email = (session as any)?.user?.email?.toString().toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
    }

    const provider = "metaapi";
    const platform = (body.platform || "mt5") as "mt4" | "mt5";
    const region = normStr(body.region);
    const login = normStr(body.login);
    const server = normStr(body.server);
    const password = normStr((body as any).password);
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
    const up = await db.query(
      `
      INSERT INTO cefi_accounts
        (tenant_id, provider, metaapi_platform, metaapi_region, metaapi_login, metaapi_server, metaapi_account_id, status)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, 'pending')
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
      [tenantId, provider, platform, region, login, server, metaapiAccountId]
    );


        // --- notify coordinator to provision broker (best-effort) ---

        try {

          const base = process.env.COORDINATOR_BASE_URL;

          const key = process.env.COORDINATOR_INTERNAL_KEY;

          if (base && key) {

            fetch(`${base}/v1/broker/provision`, {

              method: "POST",

              headers: {

                "Content-Type": "application/json",

                "X-Internal-Key": key,

              },

              body: JSON.stringify({ email, platform, login, password, server, region }),

            }).catch(() => {});

          }

        } catch {}


    return NextResponse.json(
      {
        ok: true,
        broker: up.rows[0],
        note:
          "Saved broker connection request (pending). Next step: Coordinator provisioning/bind + first sync.",
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
