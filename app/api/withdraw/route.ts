import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { db } from "@/lib/db";

import { getBearerSession } from "@/lib/bearer-session";
// USDC Arbitrum One (native)
const USDC_ADDR_FALLBACK = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// ABI minimale ERC20 (serve SOLO balanceOf)
const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
];

// ABI del TradingAccount: SOLO quello che ci serve
const TA_ABI = [
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig)",
  "function nonces(address)(uint256)",
  "function owner()(address)",
];

function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

function normalizeEvmAddr(a: string) {
  return (a || "").toString().trim();
}

function getRpcUrl() {
  // Accettiamo TUTTI i nomi che stai usando in repo/Vercel
  return (
    (process.env.ARBITRUM_RPC_URL || "").trim() ||
    (process.env.ARB_RPC_URL || "").trim() ||
    (process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "").trim()
  );
}

function getUsdcAddr() {
  return (process.env.USDC || "").trim() || USDC_ADDR_FALLBACK;
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
    // 1) Auth (sessione Magic/JWT)
    const session = getBearerSession(req);
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Must be authenticated!");

    // 2) Env check
    const RPC_URL = getRpcUrl();
    const RELAYER_PK = (process.env.RELAYER_PRIVATE_KEY || "").trim();
    const USDC = getUsdcAddr();

    if (!RPC_URL) return jsonError(500, "ARB_RPC_URL mancante");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante");
    if (!USDC) return jsonError(500, "USDC mancante");

    // 3) Body: servono TUTTI (firma EIP-712 generata dal client)
    const body = await req.json().catch(() => ({} as any));

    const to = normalizeEvmAddr(body?.to);
    const amountRaw = normalizeEvmAddr(body?.amount); // base units (6 dec)
    const deadlineRaw = normalizeEvmAddr(body?.deadline);
    const sig = normalizeEvmAddr(body?.sig);

    if (!to) return jsonError(400, "Destinatario mancante");
    if (!amountRaw) return jsonError(400, "Importo mancante");
    if (!deadlineRaw) return jsonError(400, "Deadline mancante");
    if (!sig) return jsonError(400, "Firma mancante");

    const amountBI = BigInt(amountRaw);
    if (amountBI <= BigInt(0)) return jsonError(400, "Importo non valido", "BAD_AMOUNT");

    const deadlineBI = BigInt(deadlineRaw);

    // 4) Resolve TradingAccount (TA) dal DB (vero multi-tenant)
    const TA = await fetchTradingAddress(email);
    if (!TA) return jsonError(404, "Trading account non trovato", "NO_TRADING_ACCOUNT");

    // 5) Provider + relayer wallet (paga SOLO gas)
    const provider = new JsonRpcProvider(RPC_URL);
    const relayer = new Wallet(RELAYER_PK, provider);

    // 6) Check saldo USDC del TA (bank-grade UX)
    const usdc = new Contract(USDC, ERC20_ABI, provider);
    const balBefore: bigint = await usdc.balanceOf(TA);

    if (balBefore < amountBI) {
      return jsonError(400, "Saldo insufficiente", "INSUFFICIENT_BALANCE");
    }

    // 7) Chiamata: TA.withdrawWithSig(USDC, to, amount, deadline, sig)
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

    // mapping “banca”: errori più leggibili
    if (msg.toLowerCase().includes("expired")) return jsonError(400, "Richiesta scaduta", "EXPIRED");
    if (msg.toLowerCase().includes("bad_sig")) return jsonError(400, "Firma non valida", "BAD_SIGNATURE");
    if (msg.toLowerCase().includes("to=0")) return jsonError(400, "Destinatario non valido", "BAD_TO");
    if (msg.toLowerCase().includes("amount=0")) return jsonError(400, "Importo non valido", "BAD_AMOUNT");

    return jsonError(500, msg);
  }
}
