import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

type ToggleBody = {
  email?: string;
  enabled?: boolean;
};

function getEmailFromSession(req: NextRequest): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[Autopilot] JWT_SECRET mancante");
    return null;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authHeader.slice("bearer ".length).trim();
  if (!token) return null;

  try {
    const payload = jwt.verify(token, secret) as any;
    return (payload?.email as string) || null;
  } catch (e) {
    console.error("[Autopilot] Session token non valido:", e);
    return null;
  }
}

async function notifyCoordinator(userId: string, enabled: boolean) {
  const baseUrl = process.env.COORDINATOR_BASE_URL;
  if (!baseUrl) {
    console.warn("[Autopilot] COORDINATOR_BASE_URL non configurata, skip notify.");
    return;
  }

  const internalKey = process.env.COORDINATOR_INTERNAL_KEY || "";

  // endpoint "best guess": se lato Coordinator è diverso, lo cambiamo in 10s
  const url = `${baseUrl}/v1/autopilot/toggle`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(internalKey ? { "X-Internal-Key": internalKey } : {}),
      },
      body: JSON.stringify({
        user_id: userId,
        enabled,
        source: "cerbero-web",
      }),
    });

    if (!res.ok) {
      console.error(
        "[Autopilot] Coordinator non-ok:",
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
    const sessionEmail = getEmailFromSession(req);
    if (!sessionEmail) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
    }

    // blocco accesso cross-account
    if (email.toLowerCase() !== sessionEmail.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const result = await db.query(
      `
      SELECT autopilot_enabled
      FROM tenants
      WHERE email = $1
      LIMIT 1;
      `,
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ ok: false, error: "Tenant non trovato" }, { status: 404 });
    }

    const enabled = !!result.rows[0]?.autopilot_enabled;
    return NextResponse.json({ ok: true, enabled });
  } catch (err) {
    console.error("[Autopilot GET] Errore:", err);
    return NextResponse.json({ ok: false, error: "Errore server" }, { status: 500 });
  }
}

/**
 * POST /api/autopilot/toggle
 * Body JSON: { email: string, enabled: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const sessionEmail = getEmailFromSession(req);
    if (!sessionEmail) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as ToggleBody | null;

    if (!body || !body.email || typeof body.enabled !== "boolean") {
      return NextResponse.json({ ok: false, error: "email o enabled mancanti" }, { status: 400 });
    }

    const { email, enabled } = body;

    // blocco accesso cross-account
    if (email.toLowerCase() !== sessionEmail.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const result = await db.query(
      `
      UPDATE tenants
      SET autopilot_enabled = $1
      WHERE email = $2
      RETURNING id, email, autopilot_enabled;
      `,
      [enabled, email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ ok: false, error: "Tenant non trovato" }, { status: 404 });
    }

    const tenant = result.rows[0];

    // Notifica Coordinator (best-effort) usando user_id = email
    await notifyCoordinator(email, enabled);

    return NextResponse.json({ ok: true, tenant });
  } catch (err) {
    console.error("[Autopilot POST] Errore:", err);
    return NextResponse.json({ ok: false, error: "Errore server" }, { status: 500 });
  }
}
