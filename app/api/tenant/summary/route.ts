import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

type SessionPayload = {
  email?: string;
  wallet?: string;
};

function getBearer(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  if (!h.toLowerCase().startsWith("bearer ")) return null;
  return h.slice("bearer ".length).trim() || null;
}

async function fetchOnchainBalance(email: string) {
  const base = process.env.COORDINATOR_ONCHAIN_ENDPOINT;
  if (!base) return null;

  const internalKey =
    process.env.COORDINATOR_INTERNAL_KEY ||
    process.env.INTERNAL_API_KEY ||
    "";

  const url = `${base.replace(/\/$/, "")}/v1/account/balance?user_id=${encodeURIComponent(
    email
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(internalKey ? { "X-Internal-Key": internalKey } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[tenant/summary] coordinator balance non-ok:", res.status, txt);
    return null;
  }

  const data: any = await res.json().catch(() => null);
  if (!data) return null;

  const raw =
    data.balance_usdc ??
    data.balanceUSDC ??
    data?.data?.balance_usdc ??
    data?.data?.balanceUSDC;

  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

async function fetchTradingAddress(email: string) {
  const res = await db.query(
    `
    SELECT c.arbitrum_address
    FROM contracts c
    JOIN tenants t ON t.id = c.tenant_id
    WHERE t.email = $1
    ORDER BY c.created_at DESC NULLS LAST
    LIMIT 1;
    `,
    [email]
  );

  const addr = res.rowCount ? (res.rows[0].arbitrum_address as string | null) : null;
  return addr?.trim() || null;
}

export async function GET(req: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (JWT_SECRET missing)" },
        { status: 500 }
      );
    }

    const token = getBearer(req);
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    let payload: SessionPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const sessionEmail = (payload.email || "").toLowerCase().trim();
    if (!sessionEmail) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const emailParam = (searchParams.get("email") || "").toLowerCase().trim();
    if (emailParam && emailParam !== sessionEmail) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // in parallelo: address da DB + saldo da Coordinator
    const [tradingAddress, onchain] = await Promise.all([
      fetchTradingAddress(sessionEmail),
      fetchOnchainBalance(sessionEmail),
    ]);

    if (onchain === null) {
      // fallback DB (solo per non rompere UI)
      const res = await db.query(
        `SELECT balance_usdc FROM tenants WHERE email = $1 LIMIT 1;`,
        [sessionEmail]
      );
      if (res.rowCount === 0) {
        return NextResponse.json({ ok: false, error: "Tenant not found" }, { status: 404 });
      }
      const balanceUSDC = Number(res.rows[0].balance_usdc) || 0;
      return NextResponse.json({
        ok: true,
        balanceUSDC,
        tradingAddress,
        source: "db_fallback",
      });
    }

    // aggiorna cache DB con saldo letto da Coordinator (source of truth)
    await db.query(
      `
      UPDATE tenants
      SET balance_usdc = $1,
          updated_at = NOW()
      WHERE email = $2;
      `,
      [onchain, sessionEmail]
    );

    return NextResponse.json({
      ok: true,
      balanceUSDC: onchain,
      tradingAddress,
      source: "coordinator_onchain",
    });
  } catch (err) {
    console.error("[Tenant Summary] Error:", err);
    return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });
  }
}
