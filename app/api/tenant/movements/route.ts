import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function getBearerEmail(req: NextRequest): string | null {
  if (!JWT_SECRET) return null;

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;

  const token = authHeader.slice("bearer ".length).trim();
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const email = (payload?.email || "").toString().toLowerCase().trim();
    return email || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!JWT_SECRET) {
      console.error("[/api/tenant/movements] JWT_SECRET non impostato");
      return jsonError(500, "Server misconfigured (JWT_SECRET missing)");
    }

    const email = getBearerEmail(req);
    if (!email) return jsonError(401, "Unauthorized");

    // 1) tenant id
    const resTenant = await db.query(
      `SELECT id FROM tenants WHERE email = $1 LIMIT 1;`,
      [email]
    );
    const tenantId = resTenant.rows[0]?.id as string | undefined;
    if (!tenantId) return jsonError(404, "Tenant not found");

    // 2) tenant_movements
    const res = await db.query(
      `
      SELECT
        id,
        type,
        amount_usdc,
        metadata,
        source,
        tx_hash,
        external_ref,
        chain,
        created_at
      FROM tenant_movements
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 100;
      `,
      [tenantId]
    );

    // NB: ritorniamo sia campi "nuovi" sia compatibilità UI
    const movements = (res.rows || []).map((r: any) => {
      const amt = Number(r.amount_usdc) || 0;

      const label =
        r.type === "deposit"
          ? "Deposito"
          : r.type === "withdraw"
          ? "Prelievo"
          : r.type === "trade"
          ? "Trade"
          : r.type;

      return {
        // raw
        id: r.id,
        type: r.type,
        amountUSDC: amt,
        metadata: r.metadata ?? null,
        source: r.source ?? null,
        txHash: r.tx_hash ?? null,
        externalRef: r.external_ref ?? null,
        chain: r.chain ?? null,
        createdAt: r.created_at,

        // compat UI vecchia (se la dashboard si aspetta questi)
        labelType: label,
        detail: (r.metadata?.detail || r.metadata?.symbol || label || "Movimento") as string,
        rawAmount: amt,
        amount: `${amt >= 0 ? "+" : ""}${amt.toFixed(2)} USDC`,
      };
    });

    return NextResponse.json({ ok: true, movements }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/tenant/movements] error:", err);
    return jsonError(500, "Server error");
  }
}
