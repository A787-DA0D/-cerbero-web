import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const walletMagic = searchParams.get("walletMagic");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Number(limitParam) || 20, 100); // max 100

    if (!email && !walletMagic) {
      return NextResponse.json(
        { ok: false, error: "Provide at least email or walletMagic as query param" },
        { status: 400 }
      );
    }

    const query = `
      SELECT
        tm.id,
        tm.type,
        tm.amount_usdc,
        tm.chain,
        tm.source,
        tm.tx_hash,
        tm.external_ref,
        tm.created_at
      FROM tenant_movements tm
      JOIN tenants t ON tm.tenant_id = t.id
      WHERE
        ($1::text IS NOT NULL AND t.email = $1)
        OR
        ($2::text IS NOT NULL AND t.wallet_magic = $2)
      ORDER BY tm.created_at DESC
      LIMIT $3;
    `;

    const values = [email, walletMagic, limit];

    const result = await db.query(query, values);

    // Mappiamo in un formato comodo per il frontend wallet
    const movements = result.rows.map((row: any) => {
      const amountNumber = Number(row.amount_usdc) || 0;
      const isPositive = amountNumber >= 0;
      const signedAmount = `${isPositive ? "+" : ""}${amountNumber.toFixed(2)} USDC`;

      // Dettaglio testuale in base a tipo / source
      let detail = "Movimento saldo";
      if (row.type === "deposit" && row.source === "transak") {
        detail = "Deposito via Transak";
      } else if (row.type === "withdraw") {
        detail = "Prelievo";
      } else if (row.type === "profit") {
        detail = "Profitto strategia";
      }

      return {
        id: row.id,
        type: row.type, // es. 'deposit'
        labelType: row.type === "deposit"
          ? "Deposito"
          : row.type === "withdraw"
          ? "Prelievo"
          : row.type === "profit"
          ? "Profitto"
          : row.type,
        detail,
        chain: row.chain || "arbitrum_one",
        amount: signedAmount,
        rawAmount: amountNumber,
        source: row.source,
        txHash: row.tx_hash,
        externalRef: row.external_ref,
        createdAt: row.created_at, // ISO
      };
    });

    return NextResponse.json({ ok: true, movements });
  } catch (err) {
    console.error("[Tenant Movements] Error:", err);
    return NextResponse.json(
      { ok: false, error: "DB error" },
      { status: 500 }
    );
  }
}
