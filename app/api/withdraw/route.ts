import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { getSession } from "@/lib/auth"; // usa il tuo auth Magic
import { USDC_ABI } from "@/lib/abi/usdc";

const RPC_URL = process.env.ARB_RPC_URL!;
const RELAYER_PK = process.env.RELAYER_PRIVATE_KEY!;
const USDC_ADDRESS = process.env.USDC_ADDRESS!;
const TA_V2 = process.env.TRADING_ACCOUNT_V2!;

function jsonError(status: number, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, error: message, ...extra },
    { status }
  );
}

export async function POST(req: Request) {
  try {
    /* -------------------------------------------------- */
    /* 1) AUTH                                            */
    /* -------------------------------------------------- */
    const session = await getSession(req);
    if (!session?.email) {
      return jsonError(401, "Must be authenticated");
    }

    /* -------------------------------------------------- */
    /* 2) INPUT                                           */
    /* -------------------------------------------------- */
    const body = await req.json();
    const amountRaw = body.amount; // string o number, già in base units (6 decimali)

    if (!amountRaw) {
      return jsonError(400, "Importo mancante");
    }

    const amountBI = BigInt(amountRaw);
    if (amountBI <= BigInt(0)) {
      return jsonError(400, "Importo non valido");
    }

    /* -------------------------------------------------- */
    /* 3) SETUP CHAIN                                     */
    /* -------------------------------------------------- */
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(RELAYER_PK, provider);
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);

    /* -------------------------------------------------- */
    /* 4) BALANCE CHECK                                   */
    /* -------------------------------------------------- */
    const bal: bigint = await usdc.balanceOf(TA_V2);

    // buffer fee: 0.02 USDC = 20000 (6 decimali)
    const feeBuffer = BigInt(20000);

    if (bal < amountBI + feeBuffer) {
      return jsonError(400, "Saldo insufficiente per commissioni", {
        code: "INSUFFICIENT_FOR_FEES",
        balance: bal.toString(),
      });
    }

    /* -------------------------------------------------- */
    /* 5) TRANSFER                                        */
    /* -------------------------------------------------- */
    const tx = await usdc.transfer(body.to, amountBI);
    const receipt = await tx.wait();

    /* -------------------------------------------------- */
    /* 6) OK                                              */
    /* -------------------------------------------------- */
    const newBal: bigint = await usdc.balanceOf(TA_V2);

    return NextResponse.json({
      ok: true,
      txHash: receipt.hash,
      withdrawn: amountBI.toString(),
      balanceAfter: newBal.toString(),
    });
  } catch (err: any) {
    console.error("Withdraw error:", err);
    return jsonError(500, "Errore interno");
  }
}
