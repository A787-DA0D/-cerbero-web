import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet, verifyTypedData } from "ethers";
import { USDC_ABI } from "@/lib/abi/usdc";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-session";

// USDC Arbitrum One (native)
const USDC_ADDR_FALLBACK = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const CHAIN_ID = 42161;

// Fallback EIP-712 domain (se non leggibile dal contratto)
const EIP712_NAME_FALLBACK = "CerberoTradingAccount";
const EIP712_VERSION_FALLBACK = "1";

// ABI del TradingAccount: SOLO quello che ci serve
const TA_ABI = [
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig)",
  "function nonces(address)(uint256)",
  "function owner()(address)",
];

// EIP-5267 (se il contratto lo implementa)
const EIP712DOMAIN_ABI = [
  "function eip712Domain() view returns (bytes1,string,string,uint256,address,bytes32,uint256[])",
];

const WITHDRAW_TYPES = {
  Withdraw: [
    { name: "token", type: "address" },
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

function normalizeStr(a: any) {
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
    // 1) Auth (sessione Bearer JWT)
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

    // 3) Body: firma EIP-712 dal client
    const body = await req.json().catch(() => ({} as any));
    const to = normalizeStr(body?.to);
    const amountRaw = normalizeStr(body?.amount); // base units (6 dec)
    const deadlineRaw = normalizeStr(body?.deadline);
    const sig = normalizeStr(body?.sig);

    if (!to) return jsonError(400, "Destinatario mancante");
    if (!amountRaw) return jsonError(400, "Importo mancante");
    if (!deadlineRaw) return jsonError(400, "Deadline mancante");
    if (!sig) return jsonError(400, "Firma mancante");

    const amountBI = BigInt(amountRaw);
    if (amountBI <= 0n) return jsonError(400, "Importo non valido", "BAD_AMOUNT");
    const deadlineBI = BigInt(deadlineRaw);

    // 4) Resolve TradingAccount (TA) dal DB
    const TA = await fetchTradingAddress(email);
    if (!TA) return jsonError(404, "Trading account non trovato", "NO_TRADING_ACCOUNT");

    // 5) Provider + relayer wallet (paga SOLO gas)
    const provider = new JsonRpcProvider(RPC_URL);
    const relayer = new Wallet(RELAYER_PK, provider);

    // ==========================
    // DEBUG FIRMA: recovered vs owner
    // ==========================
    const taRO = new Contract(TA, [...TA_ABI, ...EIP712DOMAIN_ABI], provider);

    const ownerOnchain: string = await taRO.owner();
    const nonceOnchain: bigint = await taRO.nonces(ownerOnchain);

    // prova a leggere domain vero dal contratto (se supporta eip712Domain)
    let dName = EIP712_NAME_FALLBACK;
    let dVersion = EIP712_VERSION_FALLBACK;
    let dChainId = CHAIN_ID;

    try {
      const res = await taRO.eip712Domain();
      // res = (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, ...)
      if (res?.[1]) dName = res[1];
      if (res?.[2]) dVersion = res[2];
      if (res?.[3]) dChainId = Number(res[3]);
    } catch {
      // fallback
    }

    const domain = {
      name: dName,
      version: dVersion,
      chainId: dChainId,
      verifyingContract: TA,
    };

    const message = {
      token: USDC,
      to,
      amount: amountBI,
      nonce: nonceOnchain,
      deadline: deadlineBI,
    };

    let recovered = "";
    try {
      recovered = verifyTypedData(domain as any, WITHDRAW_TYPES as any, message as any, sig);
    } catch (err: any) {
      return jsonError(
        400,
        `Firma non valida (verifyTypedData error): ${String(err?.message || err)}`,
        "BAD_SIGNATURE"
      );
    }

    if (recovered.toLowerCase() !== ownerOnchain.toLowerCase()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Firma non valida (recovered != owner)",
          code: "BAD_SIGNATURE",
          debug: {
            ownerOnchain,
            recovered,
            nonce: nonceOnchain.toString(),
            domain,
          },
        },
        { status: 400 }
      );
    }

    // 6) Check saldo USDC del TA
    const usdc = new Contract(USDC, USDC_ABI, provider);
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

    const low = msg.toLowerCase();
    if (low.includes("expired")) return jsonError(400, "Richiesta scaduta", "EXPIRED");
    if (low.includes("bad_sig") || low.includes("invalid signature"))
      return jsonError(400, "Firma non valida", "BAD_SIGNATURE");
    if (low.includes("to=0")) return jsonError(400, "Destinatario non valido", "BAD_TO");
    if (low.includes("amount=0")) return jsonError(400, "Importo non valido", "BAD_AMOUNT");

    return jsonError(500, msg);
  }
}
