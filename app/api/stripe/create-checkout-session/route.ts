import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const STRIPE_PRICE_ID_AUTOPILOT = process.env
  .STRIPE_PRICE_ID_AUTOPILOT as string | undefined;
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET as string | undefined;

if (!STRIPE_SECRET_KEY) {
  console.warn("[Stripe] STRIPE_SECRET_KEY non impostata");
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  : null;

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

    // 2) Tenant + stripe_customer_id
    const client = await db.connect();
    try {
      const tenantRes = await client.query(
        `
        SELECT id, email, stripe_customer_id
        FROM tenants
        WHERE email = $1
        LIMIT 1;
      `,
        [email]
      );

      const tenant = tenantRes.rows[0];

      if (!tenant) {
        return NextResponse.json(
          { ok: false, error: "Tenant not found for this email" },
          { status: 404 }
        );
      }

      let stripeCustomerId: string | null = tenant.stripe_customer_id;

      if (!stripeCustomerId) {
        // Creiamo il customer su Stripe
        const customer = await stripe.customers.create({
          email,
          metadata: {
            tenantId: tenant.id,
          },
        });

        stripeCustomerId = customer.id;

        // Salviamo nel DB
        await client.query(
          `
          UPDATE tenants
          SET stripe_customer_id = $1
          WHERE id = $2;
        `,
          [stripeCustomerId, tenant.id]
        );
      }

      // 3) Creiamo la Checkout Session per il piano Autopilot
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [
          {
            price: STRIPE_PRICE_ID_AUTOPILOT,
            quantity: 1,
          },
        ],
        success_url: `${APP_URL}/wallet?stripe=success`,
        cancel_url: `${APP_URL}/pricing?stripe=cancel`,
        metadata: {
          tenantId: tenant.id,
          email: tenant.email,
          plan: "autopilot",
        },
      });

      return NextResponse.json(
        {
          ok: true,
          url: session.url,
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[Stripe] create-checkout-session error:", err);
    return NextResponse.json(
      { ok: false, error: "Stripe create-checkout-session failed" },
      { status: 500 }
    );
  }
}
