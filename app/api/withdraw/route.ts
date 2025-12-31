// app/api/withdraw/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

export const runtime = "nodejs"; // IMPORTANT: ethers + Wallet su Vercel devono girare su Node

// USDC Arbitrum One (native)
const USDC_ADDR_FALLBACK = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// ABI minimi (evitiamo import esterni che possono essere sbagliati)
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

const TA_ABI = [
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig) external",
  "function nonces(address) view returns (uint256)",
  "function owner() view returns (address)",
];

function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

function normalizeStr(v: any) {
  return (v ?? "").toString().trim();
}

function getRpcUrl() {
  return (
    normalizeStr(process.env.ARBITRUM_RPC_URL) ||
    normalizeStr(process.env.ARB_RPC_URL) ||
    normalizeStr(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL)
  );
}

function getUsdcAddr() {
  return normalizeStr(process.env.USDC) || USDC_ADDR_FALLBACK;
}

async function fetchTradingAddress(email: string): Promise<string | null> {
  // Proviamo prima dal tenant (source “principale” della dashboard)
  const t = await db.query(
    `SELECT smart_contract_address FROM tenants WHERE email = $1 LIMIT 1;`,
    [email]
  );
  const fromTenant =
    t.rowCount && t.rows?.[0]?.smart_contract_address
      ? (t.rows[0].smart_contract_address as string).trim()
      : null;
  if (fromTenant) return fromTenant;

  // Fallback: vecchia tabella contracts
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
    // 1) Auth
    const session = getBearerSession(req);
    const email = normalizeStr(session?.email).toLowerCase();
    if (!email) return jsonError(401, "Must be authenticated!");

    // 2) Env
    const RPC_URL = getRpcUrl();
    const RELAYER_PK = normalizeStr(process.env.RELAYER_PRIVATE_KEY);
    const USDC = getUsdcAddr();

    if (!RPC_URL) return jsonError(500, "RPC mancante (ARBITRUM_RPC_URL/ARB_RPC_URL/NEXT_PUBLIC_ARBITRUM_RPC_URL)", "MISSING_RPC");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante", "MISSING_RELAYER_PK");
    if (!USDC) return jsonError(500, "USDC mancante", "MISSING_USDC");

    // 3) Body
    const body = await req.json().catch(() => ({} as any));
    const to = normalizeStr(body?.to);
    const amountRaw = normalizeStr(body?.amount); // base units
    const deadlineRaw = normalizeStr(body?.deadline);
    const sig = normalizeStr(body?.sig);

    if (!to) return jsonError(400, "Destinatario mancante", "BAD_TO");
    if (!amountRaw) return jsonError(400, "Importo mancante", "BAD_AMOUNT");
    if (!deadlineRaw) return jsonError(400, "Deadline mancante", "BAD_DEADLINE");
    if (!sig) return jsonError(400, "Firma mancante", "BAD_SIG");

    const ZERO = BigInt(0);
    let amountBI: bigint;
    let deadlineBI: bigint;

    try {
      amountBI = BigInt(amountRaw);
    } catch {
      return jsonError(400, "Importo non valido", "BAD_AMOUNT");
    }
    if (amountBI <= ZERO) return jsonError(400, "Importo non valido", "BAD_AMOUNT");

    try {
      deadlineBI = BigInt(deadlineRaw);
    } catch {
      return jsonError(400, "Deadline non valida", "BAD_DEADLINE");
    }

    // 4) Resolve TA
    const TA = await fetchTradingAddress(email);
    if (!TA) return jsonError(404, "Trading account non trovato", "NO_TRADING_ACCOUNT");

    // 5) Provider + relayer
    const provider = new JsonRpcProvider(RPC_URL, 42161);
    const relayer = new Wallet(RELAYER_PK, provider);

    // 6) Check balance USDC
    const usdc = new Contract(USDC, ERC20_ABI, provider);
    const balBefore: bigint = await usdc.balanceOf(TA);
    if (balBefore < amountBI) return jsonError(400, "Saldo insufficiente", "INSUFFICIENT_BALANCE");

    // 7) Safety: verifica che TA abbia la funzione (errore più chiaro)
    const taRead = new Contract(TA, TA_ABI, provider);
    try {
      // se l’ABI non matcha o l’indirizzo non è un TA, qui esplode con errore leggibile
      await taRead.nonces(await relayer.getAddress()).catch(() => ZERO);
    } catch (e: any) {
      const m = (e?.shortMessage || e?.message || "").toString();
      return jsonError(
        500,
        `TradingAccount ABI/Address mismatch. TA=${TA}. Dettaglio: ${m}`,
        "TA_ABI_MISMATCH"
      );
    }

    // 8) Withdraw via relayer (gas pagato dal relayer, fondi dal TA)
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

    const low = msg.toLowerCase();
    if (low.includes("expired")) return jsonError(400, "Richiesta scaduta", "EXPIRED");
    if (low.includes("bad_sig") || low.includes("invalid signature")) return jsonError(400, "Firma non valida", "BAD_SIGNATURE");
    if (low.includes("insufficient funds")) return jsonError(400, "Relayer senza ETH per gas", "RELAYER_NO_GAS");

    return jsonError(500, msg);
  }
}
