import { NextRequest, NextResponse } from "next/server";

const TRANSAK_WEBHOOK_SECRET =
  process.env.TRANSAK_WEBHOOK_SECRET as string | undefined;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    // -----------------------------
    // 0) Check configurazione
    // -----------------------------
    if (!TRANSAK_WEBHOOK_SECRET) {
      console.error("[Transak Webhook] TRANSAK_WEBHOOK_SECRET mancante");
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (missing webhook secret)" },
        { status: 500 }
      );
    }

    // -----------------------------
    // 1) Autenticazione webhook
    // -----------------------------
    const secretHeader = req.headers.get("x-transak-secret");
    if (!secretHeader || secretHeader !== TRANSAK_WEBHOOK_SECRET) {
      console.warn("[Transak Webhook] Secret non valido o assente");
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -----------------------------
    // 2) Parse body
    // -----------------------------
    const body: any = await req.json();
    console.log("[Transak Webhook] Payload ricevuto:", body);

    const rawStatus =
      body.status ||
      body.event ||
      body.webhookData?.status ||
      body.transferStatus;

    if (!rawStatus) {
      return NextResponse.json(
        { ok: false, error: "Missing status in payload" },
        { status: 400 }
      );
    }

    const status = String(rawStatus).toUpperCase();

    const COMPLETED_STATUSES = [
      "COMPLETED",
      "SUCCESS",
      "DONE",
      "COMPLETED_VERIFIED",
    ];

    if (!COMPLETED_STATUSES.includes(status)) {
      console.log("[Transak Webhook] Status non definitivo, skip:", status);
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "Status not completed",
        status,
      });
    }

    // -----------------------------
    // 3) Identità utente
    // -----------------------------
    const email: string | null =
      body.customerEmail ||
      body.userEmail ||
      body.email ||
      body.webhookData?.customerEmail ||
      null;

    const walletAddress: string | null =
      body.walletAddress ||
      body.destinationWalletAddress ||
      body.webhookData?.walletAddress ||
      null;

    if (!email && !walletAddress) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing user identity (email or walletAddress required)",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // 4) Importo transak → USDC
    // -----------------------------
    const cryptoAmountRaw =
      body.cryptoAmount ||
      body.cryptoAmountInUsd ||
      body.webhookData?.cryptoAmount ||
      null;

    if (!cryptoAmountRaw) {
      return NextResponse.json(
        { ok: false, error: "Missing cryptoAmount" },
        { status: 400 }
      );
    }

    const deltaUSDC = Number(cryptoAmountRaw);
    if (!Number.isFinite(deltaUSDC)) {
      return NextResponse.json(
        { ok: false, error: "Invalid cryptoAmount" },
        { status: 400 }
      );
    }

    // -----------------------------
    // 5) Metadati utili
    // -----------------------------
    const txHash: string | null =
      body.transactionHash ||
      body.txHash ||
      body.webhookData?.transactionHash ||
      null;

    const externalRef: string | null =
      body.id ||
      body.orderId ||
      body.webhookData?.id ||
      body.webhookData?.orderId ||
      null;

    // -----------------------------
    // 6) Chiamata al nostro update-balance
    // -----------------------------
    const updateRes = await fetch(`${APP_URL}/api/tenant/update-balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_API_KEY ? { "x-internal-key": INTERNAL_API_KEY } : {}),
      },
      body: JSON.stringify({
        email,
        walletMagic: walletAddress,
        deltaUSDC,
        type: "deposit",
        source: "transak",
        chain: "arbitrum_one",
        txHash,
        externalRef,
        metadata: body,
      }),
    });

    const updateJson = await updateRes.json().catch(() => null);

    if (!updateRes.ok || !updateJson?.ok) {
      console.error("[Transak Webhook] update-balance FAILED", {
        status: updateRes.status,
        response: updateJson,
      });

      return NextResponse.json(
        { ok: false, error: "Failed to update tenant balance" },
        { status: 500 }
      );
    }

    console.log("[Transak Webhook] Balance aggiornato OK", {
      email,
      walletAddress,
      deltaUSDC,
      txHash,
      externalRef,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Transak Webhook] Errore inatteso:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
