import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type ToggleBody = {
  email?: string;
  enabled?: boolean;
};

async function notifyCoordinator(email: string, enabled: boolean) {
  const baseUrl = process.env.COORDINATOR_BASE_URL;
  if (!baseUrl) {
    console.warn(
      "[Autopilot] COORDINATOR_BASE_URL non configurata, salto notifica."
    );
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/autopilot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        enabled,
        source: "cerbero-dashboard",
      }),
    });

    if (!res.ok) {
      console.error(
        "[Autopilot] Coordinator ha risposto non-ok:",
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (err) {
    console.error("[Autopilot] Errore chiamando Coordinator:", err);
  }
}

/**
 * GET /api/autopilot/toggle?email=...
 * Ritorna lo stato corrente di autopilot per quel tenant.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Missing email" },
        { status: 400 }
      );
    }

    const client = await db.connect();
    try {
      const result = await client.query(
        `
        SELECT autopilot_enabled
        FROM tenants
        WHERE email = $1
        LIMIT 1;
      `,
        [email]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { ok: false, error: "Tenant non trovato" },
          { status: 404 }
        );
      }

      const row = result.rows[0];
      const enabled = !!row.autopilot_enabled;

      return NextResponse.json({ ok: true, enabled });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[Autopilot GET] Errore:", err);
    return NextResponse.json(
      { ok: false, error: "Errore server" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/autopilot/toggle
 * Body JSON: { email: string, enabled: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as ToggleBody | null;

    if (!body || !body.email || typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "email o enabled mancanti" },
        { status: 400 }
      );
    }

    const { email, enabled } = body;

    const client = await db.connect();
    try {
      const result = await client.query(
        `
        UPDATE tenants
        SET autopilot_enabled = $1,
            updated_at = NOW()
        WHERE email = $2
        RETURNING id, email, autopilot_enabled;
      `,
        [enabled, email]
      );

      if (result.rowCount === 0) {
        console.error(
          "[Autopilot POST] Nessun tenant trovato per email:",
          email
        );
        return NextResponse.json(
          { ok: false, error: "Tenant non trovato" },
          { status: 404 }
        );
      }

      const tenant = result.rows[0];
      console.log("[Autopilot POST] Tenant aggiornato:", tenant);

      // Notifica Coordinator (best-effort)
      await notifyCoordinator(email, enabled);

      return NextResponse.json({ ok: true, tenant });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[Autopilot POST] Errore:", err);
    return NextResponse.json(
      { ok: false, error: "Errore server" },
      { status: 500 }
    );
  }
}
