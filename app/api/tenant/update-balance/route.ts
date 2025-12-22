import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const session = getBearerSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Unauthorized");

    const body = await req.json().catch(() => null);
    const balanceUSDC = Number(body?.balanceUSDC);

    if (!Number.isFinite(balanceUSDC) || balanceUSDC < 0) {
      return jsonError(400, "Invalid balanceUSDC");
    }

    await db.query(
      `UPDATE tenants SET balance_usdc = $1 WHERE email = $2`,
      [balanceUSDC, email]
    );

    return NextResponse.json({ ok: true, email, balanceUSDC }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/tenant/update-balance] error:", err);
    return jsonError(500, "Server error");
  }
}
