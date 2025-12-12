import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PRICE_ID_AUTOPILOT = process.env.STRIPE_PRICE_ID_AUTOPILOT || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

export async function POST(req: NextRequest) {
  try {
    if (!stripe || !STRIPE_PRICE_ID_AUTOPILOT) {
      return NextResponse.json(
        { ok: false, error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    if (!isValidEmailFormat(email)) {
      return NextResponse.json(
        { ok: false, error: "EMAIL_INVALID" },
        { status: 400 }
      );
    }

    // Checkout: niente tenant DB qui (lo facciamo nel webhook a pagamento completato)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: STRIPE_PRICE_ID_AUTOPILOT, quantity: 1 }],
      success_url: `${APP_URL}/login?stripe=success&email=${encodeURIComponent(email)}`,
      cancel_url: `${APP_URL}/signup?stripe=cancel`,
      allow_promotion_codes: true,
      metadata: {
        signup_name: name,
        signup_email: email,
        origin: "signup",
      },
    });

    return NextResponse.json({
      ok: true,
      redirectUrl: session.url,
    });
  } catch (err: any) {
    console.error("[/api/register] error:", err);
    return NextResponse.json(
      { ok: false, error: "REGISTER_ERROR" },
      { status: 500 }
    );
  }
}
