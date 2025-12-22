import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { getSession } from "@/lib/auth";
import { USDC_ABI } from "@/lib/abi/usdc";

const RPC_URL = (process.env.ARB_RPC_URL || "").trim();
const RELAYER_PK = (process.env.RELAYER_PRIVATE_KEY || "").trim();

// Trading Account V2 (quello attivo)
const TA_V2 = (process.env.TA_V2 || "").trim();

// USDC Arbitrum One
const USDC = (process.env.USDC || "").trim();

function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

export async function POST(req: Request) {
  try {
    // 1) Auth minimale (poi lo rendiamo “vero” con Magic)
    const session = await getSession(req);
    if (!session?.email) return jsonError(401, "Must be authenticated!");

    // 2) Env check
    if (!RPC_URL) return jsonError(500, "ARB_RPC_URL mancante");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante");
    if (!TA_V2) return jsonError(500, "TA_V2 mancante");
    if (!USDC) return jsonError(500, "USDC mancante");

    // 3) Parse body
    const body = await req.json().catch(() => ({}));
    const to = (body?.to || "").trim();
    const amountRaw = (body?.amount || "").toString().trim(); // amount già in base units (6 decimali)

    if (!to) return jsonError(400, "Destinatario mancante");
    if (!amountRaw) return jsonError(400, "Importo mancante");

    const amountBI = BigInt(amountRaw);
    const ZERO = BigInt(0);
    if (amountBI <= ZERO) return jsonError(400, "Importo non valido");

    // 4) On-chain checks + send
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = new Wallet(RELAYER_PK, provider);

    const usdc = new Contract(USDC, USDC_ABI, wallet);

    const bal: bigint = await usdc.balanceOf(TA_V2);

    // Buffer fee minimo (in USDC base units) solo per UX: 0.02 USDC => 20000
    // (niente literal 20000n: usiamo BigInt())
    const feeBuffer = BigInt(20000);

    if (bal < amountBI) {
      return jsonError(400, "Saldo insufficiente", "INSUFFICIENT_BALANCE");
    }
    if (bal < (amountBI + feeBuffer)) {
      return jsonError(
        400,
        "Saldo insufficiente per commissioni (buffer)",
        "INSUFFICIENT_FOR_FEES"
      );
    }

    // NB: questo presume che TA_V2 possa inviare USDC (TA_V2 è il holder)
    // Se TA_V2 è un contract, questa route dovrà invece chiamare una funzione del TA_V2 (withdraw/transfer) - lo adattiamo dopo.
    const tx = await usdc.transfer(to, amountBI);
    const receipt = await tx.wait();

    const balAfter: bigint = await usdc.balanceOf(TA_V2);

    return NextResponse.json({
      ok: true,
      txHash: receipt?.hash || tx.hash,
      balanceBefore: bal.toString(),
      balanceAfter: balAfter.toString(),
    });
  } catch (e: any) {
    return jsonError(500, e?.message || "Unknown error");
  }
}
