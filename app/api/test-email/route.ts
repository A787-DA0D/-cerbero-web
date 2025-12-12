import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  try {
    const testEmail = "info@cerberoai.com";
    const testWalletAddress = "0xTEST_WALLET_FOR_EMAIL";

    await sendWelcomeEmail({
      to: testEmail,
      name: "Test Cerbero",
      walletAddress: testWalletAddress,
      accountUrl: "https://cerberoai.com/account",
    });

    return NextResponse.json(
      { ok: true, message: "Email di test inviata!" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Errore nel test email:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Errore sconosciuto" },
      { status: 500 }
    );
  }
}
