import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

type SessionPayload = {
  email?: string;
  wallet?: string;
};

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function getBearer(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  if (!h.toLowerCase().startsWith("bearer ")) return null;
  return h.slice("bearer ".length).trim() || null;
}

export async function GET(req: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return jsonError(500, "Server misconfigured (JWT_SECRET missing)");

    // 1) Auth: richiede JWT (Magic session)
    const token = getBearer(req);
    if (!token) return jsonError(401, "Unauthorized");

    let payload: SessionPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return jsonError(401, "Unauthorized");
    }

    const sessionEmail = (payload.email || "").toLowerCase().trim();
    if (!sessionEmail) return jsonError(401, "Unauthorized");

    // 2) (opzionale) se passa ?email=... deve combaciare con session
    const { searchParams } = new URL(req.url);
    const emailParam = (searchParams.get("email") || "").toLowerCase().trim();
    if (emailParam && emailParam !== sessionEmail) {
      return jsonError(403, "Forbidden");
    }

    // 3) Trova tenant_id
    const resTenant = await db.query(
      `SELECT id FROM tenants WHERE email = $1 LIMIT 1`,
      [sessionEmail]
    );
    const tenantId = resTenant.rowCount ? (resTenant.rows[0].id as string) : null;
    if (!tenantId) return jsonError(404, "Tenant not found");

    // 4) Movimenti
    const resMov = await db.query(
      `
      SELECT
        id,
        created_at AS "createdAt",
        type,
        label_type AS "labelType",
        detail,
        chain,
        amount,
        raw_amount AS "rawAmount"
      FROM tenant_movements
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 50;
      `,
      [tenantId]
    );

    return NextResponse.json(
      { ok: true, movements: resMov.rows },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/tenant/movements] error:", err);
    return jsonError(500, "DB error");
  }
}
