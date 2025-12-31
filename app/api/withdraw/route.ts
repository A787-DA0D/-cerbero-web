import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

// Arbitrum One
const CHAIN_ID = 42161;

// USDC Arbitrum One (native)
const USDC_ADDR_FALLBACK = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// ABI MINIMA (evita problemi “balanceOf is not a function”)
const ERC20_MIN_ABI = ["function balanceOf(address) view returns (uint256)"];

// ABI del TradingAccount: solo quello che ci serve
const TA_ABI = [
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig)",
];

function jsonError(status: number, message: string, code?: string, extra?: any) {
  return NextResponse.json({ ok: false, error: message, code, ...extra }, { status });
}

function normStr(x: any) {
  return (x ?? "").toString().trim();
}

function getRpcUrl() {
  return (
    normStr(process.env.ARBITRUM_RPC_URL) ||
    normStr(process.env.ARB_RPC_URL) ||
    normStr(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL)
  );
}

function getUsdcAddr() {
  return normStr(process.env.USDC) || USDC_ADDR_FALLBACK;
}

async function fetchTradingAddress(email: string): Promise<string | null> {
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

export async function POST(req: NextRequest) {
  try {
    // 1) Auth (Bearer)
    const session = getBearerSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Must be authenticated!");

    // 2) Env
    const RPC_URL = getRpcUrl();
    const RELAYER_PK = normStr(process.env.RELAYER_PRIVATE_KEY);
    const USDC = getUsdcAddr();

    if (!RPC_URL) return jsonError(500, "Missing RPC URL (ARBITRUM_RPC_URL / ARB_RPC_URL / NEXT_PUBLIC_ARBITRUM_RPC_URL)");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante");
    if (!USDC) return jsonError(500, "USDC mancante");

    // 3) Body
    const body = await req.json().catch(() => ({} as any));

    const to = normStr(body?.to);
    const amountRaw = normStr(body?.amount);     // base units (6 dec) as string
    const deadlineRaw = normStr(body?.deadline); // unix seconds as string
    const sig = normStr(body?.sig);
    const debug = !!body?.debug;

    if (!to) return jsonError(400, "Destinatario mancante");
    if (!amountRaw) return jsonError(400, "Importo mancante");
    if (!deadlineRaw) return jsonError(400, "Deadline mancante");
    if (!sig) return jsonError(400, "Firma mancante");

    let amountBI: bigint;
    let deadlineBI: bigint;

    try {
      amountBI = BigInt(amountRaw);
    } catch {
      return jsonError(400, "Importo non valido", "BAD_AMOUNT");
    }
    if (amountBI <= BigInt(0)) return jsonError(400, "Importo non valido", "BAD_AMOUNT");

    try {
      deadlineBI = BigInt(deadlineRaw);
    } catch {
      return jsonError(400, "Deadline non valida", "BAD_DEADLINE");
    }

    // 4) TA dal DB
    const TA = await fetchTradingAddress(email);
    if (!TA) return jsonError(404, "Trading account non trovato", "NO_TRADING_ACCOUNT");

    // 5) Provider + Relayer
    const provider = new JsonRpcProvider(RPC_URL, CHAIN_ID);
    const relayer = new Wallet(RELAYER_PK, provider);

    // 6) Contracts read
    const usdc = new Contract(USDC, ERC20_MIN_ABI, provider);
    const taRead = new Contract(TA, TA_ABI, provider);

    return jsonError(500, msg);
  }
}
