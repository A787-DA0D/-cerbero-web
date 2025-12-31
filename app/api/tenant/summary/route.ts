import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";
import { JsonRpcProvider, Contract, formatUnits } from "ethers";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// Arbitrum One USDC
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_DECIMALS = 6;
const ERC20_ABI = ["function balanceOf(address account) view returns (uint256)"];

export async function GET(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Unauthorized");

    const res = await db.query(
      `
      SELECT
        t.id,
        t.autopilot_enabled,
        t.smart_contract_address,
        c.arbitrum_address
      FROM tenants
      LEFT JOIN contracts c ON c.tenant_id = t.id
      WHERE t.email = $1
      ORDER BY c.created_at DESC NULLS LAST
      LIMIT 1;
      `,
      [email]
    );

    const row = res.rows?.[0];
    if (!row?.id) return jsonError(404, "Tenant not found");

    const tradingAddress = (row.arbitrum_address || row.smart_contract_address || null) as string | null;
    const autopilotEnabled = !!row.autopilot_enabled;

    // ✅ ONCHAIN BALANCE (source of truth)
    let balanceUSDC: number | null = null;

    if (tradingAddress) {
      const rpcUrl =
        process.env.ARBITRUM_RPC_URL || process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;

      if (!rpcUrl) {
        return jsonError(500, "Missing ARBITRUM_RPC_URL");
      }

      const provider = new JsonRpcProvider(rpcUrl, 42161);
      const usdc = new Contract(USDC, ERC20_ABI, provider);
      const bal: bigint = await usdc.balanceOf(tradingAddress);

      balanceUSDC = Number(formatUnits(bal, USDC_DECIMALS));
    }

    return NextResponse.json(
      {
        ok: true,
        email,
        tradingAddress,
        balanceUSDC,
        autopilotEnabled,
        source: "onchain_balanceOf",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/tenant/summary] error:", err);
    return jsonError(500, "Server error");
  }
}
