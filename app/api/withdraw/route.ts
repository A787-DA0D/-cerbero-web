import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

// Fallback USDC Arbitrum One (native)
const USDC_ADDR_FALLBACK = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// Minimal ERC20 ABI (evitiamo mismatch tipo "balanceOf is not a function")
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

// TradingAccount ABI: SOLO la funzione che usiamo
const TA_ABI = [
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig)",
];

// Probe ABI (non rompe nulla: proviamo a leggere varie possibili funzioni “signer/owner/nonce/domain”)
const TA_PROBE_ABI = [
  // signer/owner possibili
  "function owner() view returns (address)",
  "function signer() view returns (address)",
  "function user() view returns (address)",
  "function admin() view returns (address)",
  "function wallet() view returns (address)",

  // nonce possibili
  "function nonce() view returns (uint256)",
  "function getNonce() view returns (uint256)",
  "function nonces(address) view returns (uint256)",

  // domain possibili
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function eip712Domain() view returns (bytes1,string,string,uint256,address,bytes32,uint256[])",
];

function jsonError(status: number, message: string, code?: string, extra?: any) {
  return NextResponse.json({ ok: false, error: message, code, ...(extra ? { extra } : {}) }, { status });
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

async function safeCall<T>(contract: Contract, fn: string, args: any[] = []): Promise<T | null> {
  try {
    // @ts-ignore
    const v = await contract[fn](...args);
    return v as T;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1) Auth (Bearer session)
    const session = getBearerSession(req);
    const email = normalizeStr(session?.email).toLowerCase();
    if (!email) return jsonError(401, "Must be authenticated!");

    // 2) Env
    const RPC_URL = getRpcUrl();
    const RELAYER_PK = normalizeStr(process.env.RELAYER_PRIVATE_KEY);
    const USDC = getUsdcAddr();

    if (!RPC_URL) return jsonError(500, "RPC mancante", "MISSING_RPC");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante", "MISSING_RELAYER_PK");
    if (!USDC) return jsonError(500, "USDC mancante", "MISSING_USDC");

    // 3) Body
    const body = await req.json().catch(() => ({} as any));

    const to = normalizeStr(body?.to);
    const amountRaw = normalizeStr(body?.amount); // base units 6 dec
    const deadlineRaw = normalizeStr(body?.deadline);
    const sig = normalizeStr(body?.sig);

    if (!to) return jsonError(400, "Destinatario mancante");
    if (!amountRaw) return jsonError(400, "Importo mancante");
    if (!deadlineRaw) return jsonError(400, "Deadline mancante");
    if (!sig) return jsonError(400, "Firma mancante");

    const amountBI = BigInt(amountRaw);
    if (amountBI <= BigInt(0)) return jsonError(400, "Importo non valido", "BAD_AMOUNT");
    const deadlineBI = BigInt(deadlineRaw);

    // 4) TradingAccount
    const TA = await fetchTradingAddress(email);
    if (!TA) return jsonError(404, "Trading account non trovato", "NO_TRADING_ACCOUNT");

    // 5) Provider + relayer
    const provider = new JsonRpcProvider(RPC_URL);
    const relayer = new Wallet(RELAYER_PK, provider);

    // 6) Balance check
    const usdc = new Contract(USDC, ERC20_ABI, provider);
    const balBefore: bigint = await usdc.balanceOf(TA);

    if (balBefore < amountBI) {
      return jsonError(400, "Saldo insufficiente", "INSUFFICIENT_BALANCE", {
        tradingAccount: TA,
        balance: balBefore.toString(),
        requested: amountBI.toString(),
      });
    }

    // 7) Call
    const ta = new Contract(TA, TA_ABI, relayer);

    // Preflight: staticCall per ottenere revert reason pulita senza spendere gas
    try {
      // ethers v6: staticCall
      // @ts-ignore
      await ta.withdrawWithSig.staticCall(USDC, to, amountBI, deadlineBI, sig);
    } catch (e: any) {
      const msg = (e?.shortMessage || e?.message || "Withdraw preflight failed").toString();

      // PROBING: capiamo che TA è, e chi è il signer atteso (se esiste una funzione per leggerlo)
      const probe = new Contract(TA, TA_PROBE_ABI, provider);

      const owner = await safeCall<string>(probe, "owner");
      const signer = await safeCall<string>(probe, "signer");
      const user = await safeCall<string>(probe, "user");
      const admin = await safeCall<string>(probe, "admin");
      const wallet = await safeCall<string>(probe, "wallet");

      const nonce0 = await safeCall<any>(probe, "nonce");
      const nonce1 = await safeCall<any>(probe, "getNonce");
      const nonce2 = await safeCall<any>(probe, "nonces", [owner || signer || user || admin || wallet || "0x0000000000000000000000000000000000000000"]);

      const domainSep = await safeCall<string>(probe, "DOMAIN_SEPARATOR");
      const eip712Domain = await safeCall<any>(probe, "eip712Domain");

      const extra = {
        ta: TA,
        token: USDC,
        to,
        amount: amountBI.toString(),
        deadline: deadlineBI.toString(),
        // se la session contiene anche address, lo vediamo (dipende da getBearerSession)
        session: {
          email,
          address: (session as any)?.address || (session as any)?.walletAddress || null,
        },
        expectedSigner: owner || signer || user || admin || wallet || null,
        nonce: (nonce0 ?? nonce1 ?? nonce2)?.toString?.() ?? null,
        domainSep: domainSep || null,
        eip712Domain: eip712Domain || null,
        preflightError: msg,
      };

      // mapping leggibile
      const low = msg.toLowerCase();
      if (low.includes("bad_sig") || low.includes("invalid signature") || low.includes("signature")) {
        return jsonError(400, "Firma non valida", "BAD_SIGNATURE", extra);
      }
      if (low.includes("expired") || low.includes("deadline")) {
        return jsonError(400, "Richiesta scaduta", "EXPIRED", extra);
      }

      return jsonError(400, "Withdraw rifiutato dal TA", "TA_REJECTED", extra);
    }

    // Se preflight ok → inviamo tx reale
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
    return jsonError(500, msg);
  }
}
