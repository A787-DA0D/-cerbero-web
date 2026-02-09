#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime

TARGET = Path("app/api/autopilot/toggle/route.ts")

NEW = """import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type ToggleBody = {
  email?: string;
  enabled?: boolean;
};

async function notifyCoordinator(userId: string, enabled: boolean) {
  const baseUrl = process.env.COORDINATOR_BASE_URL;
  if (!baseUrl) {
    console.warn("[Autopilot] COORDINATOR_BASE_URL non configurata, skip notify.");
    return;
  }

  const internalKey = process.env.COORDINATOR_INTERNAL_KEY || "";
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
      console.error("[Autopilot] Coordinator non-ok:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[Autopilot] Errore chiamando Coordinator:", err);
  }
}

async function getSessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions as any);
  const email = String((session as any)?.user?.email || "").toLowerCase().trim();
  return email || null;
}

/**
 * GET /api/autopilot/toggle
 * Ritorna lo stato corrente di autopilot per il tenant loggato.
 */
export async function GET(_req: NextRequest) {
  try {
    const sessionEmail = await getSessionEmail();
    if (!sessionEmail) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.query(
      `
      SELECT autopilot_enabled
      FROM tenants
      WHERE lower(email) = lower($1)
      LIMIT 1;
      `,
      [sessionEmail]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ ok: false, error: "Tenant non trovato" }, { status: 404 });
    }

    const enabled = !!result.rows[0]?.autopilot_enabled;
    return NextResponse.json({ ok: true, enabled }, { status: 200 });
  } catch (err) {
    console.error("[Autopilot GET] Errore:", err);
    return NextResponse.json({ ok: false, error: "Errore server" }, { status: 500 });
  }
}

/**
 * POST /api/autopilot/toggle
 * Body JSON: { enabled: boolean, email?: string }
 * NB: email è opzionale e viene usata solo come guard anti cross-account.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionEmail = await getSessionEmail();
    if (!sessionEmail) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as ToggleBody | null;

    if (!body || typeof body.enabled !== "boolean") {
      return NextResponse.json({ ok: false, error: "enabled mancante" }, { status: 400 });
    }

    // opzionale: se arriva email dal client, deve combaciare con la session
    if (body.email && String(body.email).toLowerCase().trim() !== sessionEmail) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const enabled = body.enabled;

    const result = await db.query(
      `
      UPDATE tenants
      SET autopilot_enabled = $1
      WHERE lower(email) = lower($2)
      RETURNING id, email, autopilot_enabled;
      `,
      [enabled, sessionEmail]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ ok: false, error: "Tenant non trovato" }, { status: 404 });
    }

    // best-effort notify
    await notifyCoordinator(sessionEmail, enabled);

    return NextResponse.json(
      { ok: true, email: sessionEmail, enabled },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Autopilot POST] Errore:", err);
    return NextResponse.json({ ok: false, error: "Errore server" }, { status: 500 });
  }
}
"""

def main():
    if not TARGET.exists():
        raise SystemExit(f"ERROR: missing {TARGET}")

    old = TARGET.read_text(encoding="utf-8")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = TARGET.with_suffix(TARGET.suffix + f".bak_nextauth_{ts}")
    bak.write_text(old, encoding="utf-8")

    TARGET.write_text(NEW, encoding="utf-8")
    print("OK: /api/autopilot/toggle now uses NextAuth session (no JWT_SECRET needed)")
    print(f"Backup: {bak}")

if __name__ == "__main__":
    main()
