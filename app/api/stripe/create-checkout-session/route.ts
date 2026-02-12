import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const STRIPE_PRICE_ID_AUTOPILOT = process.env
  .STRIPE_PRICE_ID_AUTOPILOT as string | undefined;
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET as string | undefined;

// Inizializza Stripe SENZA apiVersion (lasciamo quella di default)
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

type Body = {
  email?: string; // solo per test in dev, come fallback
};

export async function POST(req: NextRequest) {
  try {
    if (!stripe || !STRIPE_PRICE_ID_AUTOPILOT) {
      return NextResponse.json(
        { ok: false, error: "Stripe non configurato (env mancanti)" },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;

    // 1) Risolviamo email utente dal token o dal body
    let email: string | null = null;

    if (JWT_SECRET) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        const token = authHeader.slice("bearer ".length).trim();
        try {
          const payload = jwt.verify(token, JWT_SECRET) as any;
          email = payload.email ?? null;
        } catch (err) {
          console.error("[Stripe] JWT non valido:", err);
        }
      }
    }

    if (!email && body.email) {
      email = body.email;
    }

    if (!email) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing email (token o body.email)",
        },
        { status: 401 }
      );
    }
    // 2) Public funnel: NO DB, NO tenant creation here.
    // Tenant viene creato/aggiornato SOLO dal webhook Stripe (checkout.session.completed).
    // Qui creiamo solo Customer + Checkout Session.

    const customer = await stripe.customers.create({
      email,
      metadata: {
        email, // ridondante ma utile come fallback server-side
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: STRIPE_PRICE_ID_AUTOPILOT,
          quantity: 1,
        },
      ],
      // Dopo pagamento -> vai al login (l'utente riceverà il link NextAuth via email)
      success_url: `${APP_URL}/login?paid=1`,
      cancel_url: `${APP_URL}/pricing?stripe=cancel`,
      metadata: {
        email,
        plan: "autopilot",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        url: session.url,
        redirectUrl: session.url,
      },
      { status: 200 }
    );
} catch (err) {
    console.error("[Stripe] create-checkout-session error:", err);
    return NextResponse.json(
      { ok: false, error: "Stripe create-checkout-session failed" },
      { status: 500 }
    );
  }
}
