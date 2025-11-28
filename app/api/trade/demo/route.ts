import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET;
const COORDINATOR_BASE_URL = process.env.COORDINATOR_BASE_URL;
const COORDINATOR_ONCHAIN_ENDPOINT = process.env.COORDINATOR_ONCHAIN_ENDPOINT;
const COORDINATOR_INTERNAL_KEY = process.env.COORDINATOR_INTERNAL_KEY || "";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  // NODE_ENV per distinguere dev / produzione
  const NODE_ENV = process.env.NODE_ENV || "development";

  // 1) Proviamo SEMPRE prima a leggere l'email dal token (se presente)
  let email: string | null = null;

  const bearer = "bearer ";
  const header = req.headers.get("authorization") || "";
  const hasBearer = header.toLowerCase().startsWith(bearer);

  if (hasBearer && JWT_SECRET) {
    const token = header.slice(bearer.length).trim();
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      email = payload.email ?? null;
    } catch (err) {
      console.error("[/api/trade/demo] JWT non valido:", err);
    }
  }

  // 2) In development permettiamo fallback su body.email
  if (!email && NODE_ENV !== "production") {
    email = body.email ?? null;
  }

  // 3) Se ancora non abbiamo email → blocchiamo
  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Missing or unauthorized email" },
      { status: 401 }
    );
  }

  // Parametri base trade (con default sensati per il demo)
  const symbol: string = body.symbol || "ETH/USDC";
  const side: "BUY" | "SELL" = body.side || "BUY";
  const sizeUSDC: number = Number(body.sizeUSDC ?? 0);

  if (!sizeUSDC || sizeUSDC <= 0) {
    return NextResponse.json(
      { ok: false, error: "sizeUSDC must be > 0" },
      { status: 400 }
    );
  }

  const client = await db.connect();
  try {
    // Risolviamo tenant + eventuale contract attivo
    const query = `
      SELECT
        t.id AS tenant_id,
        t.email,
        t.smart_contract_address,
        c.arbitrum_address
      FROM tenants t
      LEFT JOIN contracts c
        ON c.tenant_id = t.id AND c.status = 'active'
      WHERE t.email = $1
      LIMIT 1;
    `;
    const r = await client.query(query, [email]);

    if (!r.rows.length) {
      return NextResponse.json(
        { ok: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    const row = r.rows[0];

    const tenantId: string = row.tenant_id;
    const smartContractAddress: string =
      row.smart_contract_address || row.arbitrum_address || "demo-sc-info-cerbero";

    const chain = "arbitrum_one";

    const intent = {
      tenantId,
      email,
      smartContractAddress,
      chain,
      symbol,
      side,
      sizeUSDC,
      meta: {
        source: "demo",
        trigger: "manual-test",
      },
    };

    // Se il Coordinator non è configurato, ci fermiamo qui (ma l'intent è ok)
    if (!COORDINATOR_BASE_URL || !COORDINATOR_ONCHAIN_ENDPOINT) {
      return NextResponse.json({
        ok: true,
        coordinatorCalled: false,
        coordinatorStatus: null,
        coordinatorResponse: null,
        intent,
      });
    }

    // Chiamiamo il Coordinator /v1/onchain-trade
    let coordinatorStatus: number | null = null;
    let coordinatorResponse: any = null;
    let coordinatorCalled = false;

    try {
      const url = `${COORDINATOR_BASE_URL}${COORDINATOR_ONCHAIN_ENDPOINT}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(COORDINATOR_INTERNAL_KEY
            ? { "x-api-key": COORDINATOR_INTERNAL_KEY }
            : {}),
        },
        body: JSON.stringify(intent),
      });

      coordinatorCalled = true;
      coordinatorStatus = res.status;
      coordinatorResponse = await res.json().catch(() => null);
    } catch (err) {
      console.error("[trade/demo] Error calling coordinator:", err);
      coordinatorCalled = true;
      coordinatorStatus = 500;
      coordinatorResponse = { error: "Coordinator call failed" };
    }

    return NextResponse.json({
      ok: true,
      coordinatorCalled,
      coordinatorStatus,
      coordinatorResponse,
      intent,
    });
  } catch (err) {
    console.error("[trade/demo] Fatal error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
