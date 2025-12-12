import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const email = body?.email as string | undefined;
    const enabled = body?.enabled as boolean | undefined;

    if (!email || typeof enabled !== "boolean") {
      console.error("[autotrading/toggle] bad payload:", body);
      return NextResponse.json(
        { ok: false, error: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const client = await db.connect();

    try {
      const query = `
        UPDATE tenants
        SET autopilot_enabled = $1,
            updated_at = NOW()
        WHERE email = $2
        RETURNING id, email, autopilot_enabled;
      `;
      const values = [enabled, email];

      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        console.error(
          "[autotrading/toggle] tenant non trovato per email:",
          email
        );
        return NextResponse.json(
          { ok: false, error: "TENANT_NOT_FOUND" },
          { status: 404 }
        );
      }

      const tenant = result.rows[0];

      console.log(
        "[autotrading/toggle] autopilot aggiornato:",
        tenant.id,
        tenant.email,
        "=>",
        tenant.autopilot_enabled
      );

      return NextResponse.json({ ok: true, tenant }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[autotrading/toggle] errore interno:", err);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
