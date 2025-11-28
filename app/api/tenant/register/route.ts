import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email: string | undefined = body?.email;
    const walletMagic: string | undefined = body?.walletMagic;
    const smartContractAddress: string | undefined = body?.smartContractAddress;
    const autopilotEnabled: boolean =
      typeof body?.autopilotEnabled === "boolean"
        ? body.autopilotEnabled
        : false;

    if (!email || !walletMagic || !smartContractAddress) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing required fields: email, walletMagic, smartContractAddress",
        },
        { status: 400 }
      );
    }

    // Upsert su tenants basato su email
    const query = `
      INSERT INTO tenants (
        email,
        wallet_magic,
        smart_contract_address,
        autopilot_enabled
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET
        wallet_magic = EXCLUDED.wallet_magic,
        smart_contract_address = EXCLUDED.smart_contract_address,
        autopilot_enabled = EXCLUDED.autopilot_enabled,
        updated_at = NOW()
      RETURNING id, email, wallet_magic, smart_contract_address, autopilot_enabled, balance_usdc, created_at, updated_at;
    `;

    const values = [email, walletMagic, smartContractAddress, autopilotEnabled];

    const result = await db.query(query, values);
    const tenant = result.rows[0];

    console.log("[Tenant Register] Upsert OK:", tenant);

    return NextResponse.json({
      ok: true,
      tenant,
    });
  } catch (err) {
    console.error("[Tenant Register] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }
}
