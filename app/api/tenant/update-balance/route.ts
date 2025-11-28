import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

type UpdateBalanceBody = {
  email?: string;
  walletMagic?: string;
  deltaUSDC: number;
  type: string; // 'deposit' | 'withdraw' | 'profit' | ...
  source: string; // 'transak' | 'trade_engine' | ...
  chain?: string;
  txHash?: string;
  externalRef?: string;
  metadata?: any;
};

export async function POST(req: NextRequest) {

  // 🔐 Hardening: se esiste INTERNAL_API_KEY, richiedi header x-internal-key
  if (INTERNAL_API_KEY) {
    const headerKey = req.headers.get("x-internal-key");

    if (!headerKey || headerKey !== INTERNAL_API_KEY) {
      console.error("[Tenant Update Balance] Unauthorized call", {
        hasHeader: !!headerKey,
      });
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  const client = await db.connect();
  try {
    const body = (await req.json()) as UpdateBalanceBody;

    const hasIdentity = !!body.email || !!body.walletMagic;
    if (!hasIdentity) {
      return NextResponse.json(
        { ok: false, error: "Provide at least email or walletMagic" },
        { status: 400 }
      );
    }

    if (
      typeof body.deltaUSDC !== "number" ||
      Number.isNaN(body.deltaUSDC) ||
      !body.type ||
      !body.source
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing required fields: deltaUSDC (number), type, source",
        },
        { status: 400 }
      );
    }

    const chain = body.chain || "arbitrum_one";

    // 1) Trova il tenant
    const findTenantQuery = `
      SELECT id, balance_usdc
      FROM tenants
      WHERE
        ($1::text IS NOT NULL AND email = $1)
        OR
        ($2::text IS NOT NULL AND wallet_magic = $2)
      LIMIT 1;
    `;
    const findTenantValues = [body.email ?? null, body.walletMagic ?? null];

    const tenantResult = await client.query(findTenantQuery, findTenantValues);
    const tenant = tenantResult.rows[0];

    if (!tenant) {
      console.error("[Tenant Update Balance] Tenant not found:", {
        email: body.email,
        walletMagic: body.walletMagic,
      });
      return NextResponse.json(
        { ok: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    const tenantId = tenant.id as string;
    const currentBalance = Number(tenant.balance_usdc) || 0;
    const newBalance = currentBalance + body.deltaUSDC;

    // 2) Transazione: aggiorna saldo + inserisce movimento
    await client.query("BEGIN");

    const updateTenantQuery = `
      UPDATE tenants
      SET balance_usdc = $1, updated_at = NOW()
      WHERE id = $2;
    `;
    await client.query(updateTenantQuery, [newBalance, tenantId]);

    const insertMovementQuery = `
      INSERT INTO tenant_movements (
        tenant_id,
        type,
        amount_usdc,
        chain,
        source,
        tx_hash,
        external_ref,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    await client.query(insertMovementQuery, [
      tenantId,
      body.type,
      body.deltaUSDC,
      chain,
      body.source,
      body.txHash ?? null,
      body.externalRef ?? null,
      body.metadata ? JSON.stringify(body.metadata) : null,
    ]);

    await client.query("COMMIT");

    console.log("[Tenant Update Balance] OK:", {
      tenantId,
      oldBalance: currentBalance,
      newBalance,
      delta: body.deltaUSDC,
      type: body.type,
      source: body.source,
    });

    return NextResponse.json({ ok: true, balanceUSDC: newBalance });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Tenant Update Balance] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid payload or DB error" },
      { status: 400 }
    );
  } finally {
    client.release();
  }
}
