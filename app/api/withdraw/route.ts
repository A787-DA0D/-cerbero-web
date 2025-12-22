import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet, isAddress, getAddress } from "ethers";

// --- ENV ---
const ARB_RPC = process.env.ARB_RPC_URL?.trim();
const RELAYER_PK = process.env.RELAYER_PRIVATE_KEY?.trim();

const USDC = process.env.USDC_ADDRESS?.trim();                // 0xaf88...
const TA_V2 = process.env.TRADING_ACCOUNT_V2?.trim();         // TradingAccount v2
const PONTE = process.env.PONTE_ADDRESS?.trim();              // Ponte (per fee model se serve dopo)

// Magic server-side verify (tu lo hai già nel progetto)
import { Magic } from "@magic-sdk/admin";
const magic = new Magic(process.env.MAGIC_SECRET_KEY as string);

// --- ABI MINIME ---
const TA_ABI = [
  "function owner()(address)",
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig)",
  "function nonces(address)(uint256)",
];

const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// --- Helpers ---
function jsonError(status: number, error: string, extra?: any) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export async function POST(req: Request) {
  try {
    if (!ARB_RPC) return jsonError(500, "ARB_RPC_URL mancante");
    if (!RELAYER_PK) return jsonError(500, "RELAYER_PRIVATE_KEY mancante");
    if (!USDC || !TA_V2) return jsonError(500, "USDC_ADDRESS o TRADING_ACCOUNT_V2 mancante");

    // 1) Auth: Magic (DID token in header Authorization: Bearer <token>)
    const auth = req.headers.get("authorization") || "";
    const didToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!didToken) return jsonError(401, "Must be authenticated!");

    const metadata = await magic.users.getMetadataByToken(didToken);
    // metadata.publicAddress = wallet Magic dell’utente
    const userAddr = metadata?.publicAddress;
    if (!userAddr || !isAddress(userAddr)) return jsonError(401, "Auth wallet non valida");

    // 2) Body
    const body = await req.json();
    const { to, amount, deadline, sig } = body || {};

    if (!to || !amount || !deadline || !sig) {
      return jsonError(400, "Missing fields: to, amount, deadline, sig");
    }
    if (!isAddress(to)) return jsonError(400, "Indirizzo destinatario non valido");
    if (typeof sig !== "string" || !sig.startsWith("0x")) return jsonError(400, "Firma non valida");

    const provider = new JsonRpcProvider(ARB_RPC);
    const relayer = new Wallet(RELAYER_PK, provider);

    const ta = new Contract(TA_V2, TA_ABI, relayer);
    const usdc = new Contract(USDC, USDC_ABI, provider);

    // 3) Hard security: l’utente può prelevare SOLO dal suo account (TA owner)
    const ownerOnchain: string = await ta.owner();
    if (getAddress(ownerOnchain) !== getAddress(userAddr)) {
      return jsonError(403, "Forbidden: questo account non appartiene all’utente");
    }

    // 4) Balance check (UX banca)
    // NB: amount arriva in "raw" (6 decimali) dal frontend. Quindi è già in base units.
    const amountBI = BigInt(amount);
    if (amountBI <= BigInt(0)) return jsonError(400, "Importo non valido");

    const bal: bigint = await usdc.balanceOf(TA_V2);
    if (bal < amountBI) {
      return jsonError(400, "Saldo insufficiente", {
        code: "INSUFFICIENT_BALANCE",
        balance: bal.toString(),
      });
    }

    // (Opzionale) buffer fee: per ora mettiamo un buffer minimale fisso per non bloccare UX.
    // Poi lo rendiamo “vero” quando facciamo fee preview (Step successivo).
    const feeBuffer = 20000n; // 0.02 USDC (6 decimali)
    if (bal < amountBI + feeBuffer) {
      return jsonError(400, "Saldo insufficiente per commissioni", {
        code: "INSUFFICIENT_FOR_FEES",
        balance: bal.toString(),
        needed: (amountBI + feeBuffer).toString(),
      });
    }

    // 5) Execute withdraw (relayer pays gas)
    const tx = await ta.withdrawWithSig(
      USDC,
      to,
      amountBI,
      BigInt(deadline),
      sig
    );

    const receipt = await tx.wait();

    // 6) Return new balance
    const newBal: bigint = await usdc.balanceOf(TA_V2);

    return NextResponse.json({
      ok: true,
      txHash: receipt?.hash || tx.hash,
      amount: amountBI.toString(),
      feeBuffer: feeBuffer.toString(),
      balanceBefore: bal.toString(),
      balanceAfter: newBal.toString(),
    });
  } catch (e: any) {
    const msg = e?.shortMessage || e?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
