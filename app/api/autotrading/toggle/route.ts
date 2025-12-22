import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = session?.email || "";
    if (!email) return jsonError(401, "Unauthorized");

    const body = await req.json().catch(() => null);
    const enabled = !!body?.enabled;

    // Protezione: non permettere toggle su email diversa dalla session (evita spoof)
    const bodyEmail = (body?.email || "").toString().toLowerCase().trim();
    if (bodyEmail && bodyEmail !== email) return jsonError(403, "Forbidden");

    await db.query(
      `UPDATE tenants SET autopilot_enabled = $1 WHERE email = $2`,
      [enabled, email]
    );

    return NextResponse.json({ ok: true, email, autopilot_enabled: enabled }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/autotrading/toggle] error:", err);
    return jsonError(500, "Server error");
  }
}
