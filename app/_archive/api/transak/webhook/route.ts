import { NextRequest, NextResponse } from "next/server";

const TRANSAK_WEBHOOK_SECRET = process.env
  .TRANSAK_WEBHOOK_SECRET as string | undefined;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    if (!TRANSAK_WEBHOOK_SECRET) {
      console.error("[Transak Webhook] TRANSAK_WEBHOOK_SECRET non impostata");
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (no webhook secret)" },
        { status: 500 }
      );
    }

    const sig = req.headers.get("x-transak-secret");

    if (!sig || sig !== TRANSAK_WEBHOOK_SECRET) {
      console.error("[Transak Webhook] Secret header mismatch", { sig });
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 1) Leggiamo lo status ordine
    const status =
      body.status ||
      body.webhookData?.status ||
      body.orderStatus ||
      body.webhookData?.orderStatus;

    if (status !== "COMPLETED") {
      console.log("[Transak Webhook] Ignored status:", status);
      return NextResponse.json({ ok: true, status, ignored: true });
    }

    // 2) Identità utente
    const email: string | null =
      body.user?.email ||
      body.customerEmail ||
      body.webhookData?.user?.email ||
      null;

    const walletAddress: string | null =
      body.walletAddress ||
      body.destinationWalletAddress ||
      body.webhookData?.walletAddress ||
      null;

    if (!email || !walletAddress) {
      console.error("[Transak Webhook] Missing email or walletAddress", {
        email,
        walletAddress,
      });
      return NextResponse.json(
        { ok: false, error: "Missing email or walletAddress" },
        { status: 400 }
      );
    }

    // 3) Importo in crypto (USDC) — valore assoluto
    const rawAmount =
      body.cryptoAmount ||
      body.amount ||
      body.webhookData?.cryptoAmount ||
      body.conversionPriceData?.cryptoAmount ||
      0;

    const amount = Number(rawAmount);
    if (!amount || Number.isNaN(amount)) {
      console.error("[Transak Webhook] Invalid crypto amount:", rawAmount);
      return NextResponse.json(
        { ok: false, error: "Invalid cryptoAmount" },
        { status: 400 }
      );
    }

    // 4) BUY vs SELL → decidiamo se è deposito o prelievo
    const rawSide: string | null =
      body.isBuyOrSell ||
      body.conversionPriceData?.isBuyOrSell ||
      body.webhookData?.isBuyOrSell ||
      body.webhookData?.conversionPriceData?.isBuyOrSell ||
      null;

    const side =
      typeof rawSide === "string" ? rawSide.toUpperCase().trim() : "BUY";

    const isSell = side === "SELL";
    const deltaUSDC = isSell ? -Math.abs(amount) : Math.abs(amount);
    const movementType = isSell ? "withdraw" : "deposit";

    // 5) Metadati utili
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

    // 6) Chiamiamo il nostro endpoint centrale di update-balance (protetto)
    const baseUrl =
      process.env.APP_URL || new URL(req.url).origin;

    const updateRes = await fetch(`${baseUrl}/api/tenant/update-balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_API_KEY ? { "x-internal-key": INTERNAL_API_KEY } : {}),
      },
      body: JSON.stringify({
        email,
        walletMagic: walletAddress,
        deltaUSDC,
        type: movementType,
        source: "transak",
        chain: "arbitrum_one",
        txHash,
        externalRef,
        metadata: body,
      }),
    });

    if (!updateRes.ok) {
      const text = await updateRes.text();
      console.error("[Transak Webhook] update-balance failed:", {
        status: updateRes.status,
        text,
      });
      return NextResponse.json(
        { ok: false, error: "update-balance failed", detail: text },
        { status: 500 }
      );
    }

    const json = await updateRes.json();
    console.log("[Transak Webhook] OK", {
      email,
      walletAddress,
      status,
      side,
      movementType,
      deltaUSDC,
    });

    return NextResponse.json({
      ok: true,
      status,
      side,
      deltaUSDC,
      email,
      walletAddress,
      update: json,
    });
  } catch (err) {
    console.error("[Transak Webhook] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Unhandled error in webhook" },
      { status: 500 }
    );
  }
}
