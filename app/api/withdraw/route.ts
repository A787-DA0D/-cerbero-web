import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

// USDC Arbitrum One (native)
const USDC_ADDR_FALLBACK = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// Minimal ERC20 ABI (avoid ABI/import mismatches)
const ERC20_ABI = ["function balanceOf(address account) view returns (uint256)"];

// TradingAccount ABI: ONLY what we need (no owner/nonces)
const TA_ABI = [
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig)",
];

function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

function s(v: any): string {
  return (v ?? "").toString().trim();
}

function getRpcUrl() {
  // accept all names used across Vercel / local
  return (
    s(process.env.ARBITRUM_RPC_URL) ||
    s(process.env.ARB_RPC_URL) ||
    s(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL)
  );
}

function getUsdcAddr() {
  return s(process.env.USDC) || USDC_ADDR_FALLBACK;
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
    // 1) Auth (Magic Bearer session)
    const session = getBearerSession(req);
    const email = s(session?.email).toLowerCase();
    if (!email) return jsonError(401, "Must be authenticated!");

    // 2) Env
    const RPC_URL = getRpcUrl();
    const RELAYER_PK = s(process.env.RELAYER_PRIVATE_KEY);
    const USDC = getUsdcAddr();

    if (!RPC_URL) return jsonError(500, "ARB_RPC_URL mancante");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante");
    if (!USDC) return jsonError(500, "USDC mancante");

    // 3) Body
    const body = await req.json().catch(() => ({} as any));

    const to = s(body?.to);
    const amountRaw = s(body?.amount); // base units (6 dec)
    const deadlineRaw = s(body?.deadline);
    const sig = s(body?.sig);

    if (!to) return jsonError(400, "Destinatario mancante");
    if (!amountRaw) return jsonError(400, "Importo mancante");
    if (!deadlineRaw) return jsonError(400, "Deadline mancante");
    if (!sig) return jsonError(400, "Firma mancante");

    let amountBI: bigint;
    let deadlineBI: bigint;

    try {
      amountBI = BigInt(amountRaw);
      deadlineBI = BigInt(deadlineRaw);
    } catch {
      return jsonError(400, "Importo/Deadline non validi", "BAD_INPUT");
    }

    if (amountBI <= BigInt(0)) return jsonError(400, "Importo non valido", "BAD_AMOUNT");
    if (deadlineBI <= BigInt(0)) return jsonError(400, "Deadline non valida", "BAD_DEADLINE");

    // 4) Resolve TradingAccount (TA)
    const TA = await fetchTradingAddress(email);
    if (!TA) return jsonError(404, "Trading account non trovato", "NO_TRADING_ACCOUNT");

    // 5) Provider + relayer (gas)
    const provider = new JsonRpcProvider(RPC_URL);
    const relayer = new Wallet(RELAYER_PK, provider);

    // 6) Balance check
    const usdc = new Contract(USDC, ERC20_ABI, provider);
    const balBefore: bigint = await usdc.balanceOf(TA);

    if (balBefore < amountBI) {
      return jsonError(400, "Saldo insufficiente", "INSUFFICIENT_BALANCE");
    }

    // 7) Execute withdrawWithSig
    const ta = new Contract(TA, TA_ABI, relayer);
    const tx = await ta.withdrawWithSig(USDC, to, amountBI, deadlineBI, sig);
    const receipt = await tx.wait();

    const balAfter: bigint = await usdc.balanceOf(TA);

    return NextResponse.json({
      ok: true,
      txHash: receipt?.hash || tx.hash,
      tradingAccount: TA,
      balanceBefore: balBefore.toString(),
      balanceAfter: balAfter.toString(),
    });
  } catch (e: any) {
    const msg = (e?.shortMessage || e?.message || "Unknown error").toString();

    const m = msg.toLowerCase();
    if (m.includes("expired")) return jsonError(400, "Richiesta scaduta", "EXPIRED");
    if (m.includes("bad_sig") || m.includes("invalid signature") || m.includes("invalid sig"))
      return jsonError(400, "Firma non valida", "BAD_SIGNATURE");
    if (m.includes("to=0") || m.includes("invalid address"))
      return jsonError(400, "Destinatario non valido", "BAD_TO");
    if (m.includes("amount=0") || m.includes("invalid amount"))
      return jsonError(400, "Importo non valido", "BAD_AMOUNT");

    return jsonError(500, msg);
  }
}
