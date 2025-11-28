import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const walletMagic = searchParams.get("walletMagic");

    if (!email && !walletMagic) {
      return NextResponse.json(
        { ok: false, error: "Provide at least email or walletMagic as query param" },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, balance_usdc
      FROM tenants
      WHERE
        ($1::text IS NOT NULL AND email = $1)
        OR
        ($2::text IS NOT NULL AND wallet_magic = $2)
      LIMIT 1;
    `;

    const values = [email, walletMagic];

    const result = await db.query(query, values);
    const tenant = result.rows[0];

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    const balanceUSDC = Number(tenant.balance_usdc) || 0;

    return NextResponse.json({
      ok: true,
      balanceUSDC,
    });
  } catch (err) {
    console.error("[Tenant Summary] Error:", err);
    return NextResponse.json(
      { ok: false, error: "DB error" },
      { status: 500 }
    );
  }
}
