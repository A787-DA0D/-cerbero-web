import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const ARB_RPC =
  process.env.ARB_RPC_URL?.trim() ||
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL?.trim() ||
  "https://arb1.arbitrum.io/rpc";
const RELAYER_PK = process.env.RELAYER_PRIVATE_KEY;

// TA_V1 hardcoded debug
const TA_V1 = "0xCF7c56FED88aE69450777698daCB62c89D886Eff";

const TA_V1_ABI = [
  "function withdrawWithSig(address token,address to,uint256 amount,uint256 deadline,bytes sig)",
];

export async function POST(req: Request) {
  try {
    if (!RELAYER_PK) {
      return NextResponse.json(
        { ok: false, error: "RELAYER_PRIVATE_KEY mancante" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { token, to, amount, deadline, sig } = body || {};

    if (!token || !to || !amount || !deadline || !sig) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const provider = new JsonRpcProvider(ARB_RPC);
    const wallet = new Wallet(RELAYER_PK, provider);

    const ta = new Contract(TA_V1, TA_V1_ABI, wallet);

    const tx = await ta.withdrawWithSig(
      token,
      to,
      BigInt(amount),
      BigInt(deadline),
      sig
    );

    const receipt = await tx.wait();

    return NextResponse.json({
      ok: true,
      txHash: receipt?.hash || tx.hash,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
