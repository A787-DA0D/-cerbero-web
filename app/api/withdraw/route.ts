import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { getBearerSession } from "@/lib/bearer-session";
import { USDC_ABI } from "@/lib/abi/usdc";
import { db } from "@/lib/db";

const RPC_URL = (process.env.ARB_RPC_URL || "").trim();
const RELAYER_PK = (process.env.RELAYER_PRIVATE_KEY || "").trim();
const USDC = (process.env.USDC || "").trim(); // 0xaf88... su Arbitrum One

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
  return a.trim();
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

export async function POST(req: Request) {
  try {
    // 1) Auth (Bearer: cerbero_session)
    const session = getBearerSession(req as any); // NextRequest/Request: lo usiamo coerente col tuo summary
    const email = (session?.email || "").toLowerCase().trim();
    if (!email) return jsonError(401, "Must be authenticated!");

    // 2) Env check
    if (!RPC_URL) return jsonError(500, "ARB_RPC_URL mancante");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante");
    if (!USDC) return jsonError(500, "USDC mancante");

    // 3) Body: servono TUTTI (firma EIP-712 generata dal client)
    const body = await req.json().catch(() => ({}));

    const to = normalizeEvmAddr(body?.to || "");
    const amountRaw = (body?.amount || "").toString().trim(); // base units (6 dec)
    const deadlineRaw = (body?.deadline || "").toString().trim();
    const sig = (body?.sig || "").toString().trim();

    if (!to) return jsonError(400, "Destinatario mancante");
    if (!amountRaw) return jsonError(400, "Importo mancante");
    if (!deadlineRaw) return jsonError(400, "Deadline mancante");
    if (!sig) return jsonError(400, "Firma mancante");

    const amountBI = BigInt(amountRaw);
    if (amountBI <= BigInt(0)) return jsonError(400, "Importo non valido");

    const deadlineBI = BigInt(deadlineRaw);

    // 4) Resolve TradingAccount (TA) dal DB (vero multi-tenant)
    const TA = await fetchTradingAddress(email);
    if (!TA) return jsonError(404, "Trading account non trovato", "NO_TRADING_ACCOUNT");

    // 5) Provider + relayer wallet (paga SOLO gas)
    const provider = new JsonRpcProvider(RPC_URL);
    const relayer = new Wallet(RELAYER_PK, provider);

    // 6) Check saldo USDC del TA (bank-grade UX)
    const usdc = new Contract(USDC, USDC_ABI, provider); // read-only va benissimo
    const balBefore: bigint = await usdc.balanceOf(TA);

    if (balBefore < amountBI) {
      return jsonError(400, "Saldo insufficiente", "INSUFFICIENT_BALANCE");
    }

    // (opzionale UX) feeBuffer — NON è una fee reale, solo messaggio user-friendly
    // Se vuoi tenerlo: 0.02 USDC = 20000 base units
    // const feeBuffer = 20000n;
    // if (balBefore < amountBI + feeBuffer) return jsonError(400, "Saldo insufficiente per commissioni", "INSUFFICIENT_FOR_FEES");

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
    if (msg.includes("expired")) return jsonError(400, "Richiesta scaduta", "EXPIRED");
    if (msg.includes("bad_sig")) return jsonError(400, "Firma non valida", "BAD_SIGNATURE");
    if (msg.includes("to=0")) return jsonError(400, "Destinatario non valido", "BAD_TO");
    if (msg.includes("amount=0")) return jsonError(400, "Importo non valido", "BAD_AMOUNT");

    return jsonError(500, msg);
  }
}
