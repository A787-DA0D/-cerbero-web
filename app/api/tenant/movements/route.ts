import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Ritorna gli ultimi movimenti per un tenant:
 * - DEPOSIT / WITHDRAW (Transak, manuali, ecc.)
 * - TRADE_PNL (profitti/perdite delle operazioni)
 *
 * Identificazione tenant:
 *  - ?email=...
 *  - oppure ?walletMagic=...
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const email = searchParams.get("email");
  const walletMagic = searchParams.get("walletMagic");

  if (!email && !walletMagic) {
    return NextResponse.json(
      { ok: false, error: "MISSING_IDENTIFIER" },
      { status: 400 }
    );
  }

  const client = await db.connect();

  try {
    // 1) Troviamo il tenant_id
    let tenantId: string | null = null;

    if (email) {
      const resTenant = await client.query(
        `SELECT id FROM tenants WHERE email = $1 LIMIT 1`,
        [email]
      );
      tenantId = resTenant.rows[0]?.id ?? null;
    } else if (walletMagic) {
      // Se hai una tabella che collega wallet → tenant, aggiungi qui il join.
      // Per ora assumiamo che walletMagic sia salvato come email fittizia,
      // quindi riusiamo la logica di sopra se necessario.
      const resTenant = await client.query(
        `SELECT id FROM tenants WHERE email = $1 LIMIT 1`,
        [walletMagic]
      );
      tenantId = resTenant.rows[0]?.id ?? null;
    }

    if (!tenantId) {
      return NextResponse.json({ ok: true, movements: [] }, { status: 200 });
    }

    // 2) Leggiamo TUTTI i tipi di movimenti per quel tenant,
    //    inclusi TRADE_PNL.
    const resMov = await client.query(
      `
      SELECT
        id,
        tenant_id,
        label_type,
        type,
        detail,
        chain,
        amount,
        raw_amount,
        created_at
      FROM movements
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [tenantId]
    );

    return NextResponse.json(
      {
        ok: true,
        movements: resMov.rows,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/tenant/movements] error:", err);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
