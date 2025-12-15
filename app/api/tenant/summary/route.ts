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

  // ✅ PATH DEFINITO UNA SOLA VOLTA
  const url = `${base.replace(/\/$/, "")}/v1/account/balance?user_id=${encodeURIComponent(email)}`;

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

export async function GET(req: NextRequest) {
  try {
    // ✅ SICUREZZA: serve JWT
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

    // (facoltativo) se vuoi ancora supportare query param, deve matchare la sessione
    const { searchParams } = new URL(req.url);
    const emailParam = (searchParams.get("email") || "").toLowerCase().trim();
    if (emailParam && emailParam !== sessionEmail) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // 1) Leggi saldo on-chain dal Coordinator (source of truth)
    const onchain = await fetchOnchainBalance(sessionEmail);

    // 2) Se Coordinator non risponde, fallback DB (non ideale, ma evita down totale UI)
    if (onchain === null) {
      const res = await db.query(
        `SELECT balance_usdc FROM tenants WHERE email = $1 LIMIT 1;`,
        [sessionEmail]
      );
      if (res.rowCount === 0) {
        return NextResponse.json({ ok: false, error: "Tenant not found" }, { status: 404 });
      }
      const balanceUSDC = Number(res.rows[0].balance_usdc) || 0;
      return NextResponse.json({ ok: true, balanceUSDC, source: "db_fallback" });
    }

    // 3) Aggiorna cache DB
    await db.query(
      `
      UPDATE tenants
      SET balance_usdc = $1,
          updated_at = NOW()
      WHERE email = $2;
      `,
      [onchain, sessionEmail]
    );

    return NextResponse.json({ ok: true, balanceUSDC: onchain, source: "coordinator_onchain" });
  } catch (err) {
    console.error("[Tenant Summary] Error:", err);
    return NextResponse.json({ ok: false, error: "DB error" }, { status: 500 });
  }
}
