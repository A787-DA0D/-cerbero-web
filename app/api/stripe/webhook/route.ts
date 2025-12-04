import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;

// Forziamo runtime Node (niente Edge) per avere il body raw
export const runtime = "nodejs";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export async function POST(req: NextRequest) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.error("[Stripe Webhook] Stripe non configurato (env mancanti)");
    return NextResponse.json(
      { error: "Stripe non configurato (env mancanti)" },
      { status: 500 }
    );
  }

  // 1) Recuperiamo il RAW body + firma Stripe
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // 2) Gestiamo i vari tipi di evento che ci interessano
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Dovrebbe essere una SUBSCRIPTION
      if (session.mode !== "subscription") {
        console.log(
          "[Stripe Webhook] checkout.session.completed non-subscription, ignoro"
        );
        break;
      }

      // Email utente
      const email =
        session.customer_details?.email ??
        session.customer_email ??
        null;

      // Stripe Customer ID
      let stripeCustomerId: string | null = null;
      if (typeof session.customer === "string") {
        stripeCustomerId = session.customer;
      } else if (session.customer && "id" in session.customer) {
        stripeCustomerId = (session.customer as any).id;
      }

      if (!email || !stripeCustomerId) {
        console.error(
          "[Stripe Webhook] Manca email o customerId, non posso aggiornare tenant",
          { email, stripeCustomerId }
        );
        break;
      }

      try {
        const client = await db.connect();
        try {
          const query = `
            UPDATE tenants
            SET stripe_customer_id = $1,
                autopilot_enabled = TRUE,
                updated_at = NOW()
            WHERE email = $2
            RETURNING id, email, stripe_customer_id, autopilot_enabled;
          `;
          const values = [stripeCustomerId, email];

          const result = await client.query(query, values);
          const tenant = result.rows[0];

          if (!tenant) {
            console.error(
              "[Stripe Webhook] Nessun tenant trovato per email:",
              email
            );
          } else {
            console.log("[Stripe Webhook] Tenant aggiornato OK:", tenant);

            // Dopo aver aggiornato il tenant, inviamo la welcome email
            try {
              const walletAddress =
                tenant.wallet_magic_address ??
                tenant.wallet_address ??
                tenant.wallet ??
                "";

              await sendWelcomeEmail(email, walletAddress);
              console.log("[Stripe Webhook] Welcome email inviata a:", email);
            } catch (err) {
              console.error(
                "[Stripe Webhook] Errore durante invio welcome email:",
                err
              );
            }
          }
        } finally {
          client.release();
        }
      } catch (err) {
        console.error(
          "[Stripe Webhook] Errore aggiornando tenant in DB:",
          err
        );
      }

      break;
    }

    // In futuro potremo gestire cancellazioni abbonamento, ecc.
    case "customer.subscription.deleted": {
      console.log(
        "[Stripe Webhook] customer.subscription.deleted ricevuto (TODO: disattivare autopilot)"
      );
      break;
    }

    default: {
      // Per ora logghiamo solo
      console.log("[Stripe Webhook] Evento ignorato:", event.type);
    }
  }

  // Stripe vuole comunque un 200 per considerare il webhook "ok"
  return NextResponse.json({ received: true }, { status: 200 });
}
