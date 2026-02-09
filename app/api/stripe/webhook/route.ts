import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { isFounder } from "@/lib/founder";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const EMAIL_WEBHOOK_URL = process.env.EMAIL_WEBHOOK_URL || "";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

async function sendNotificationEmail(opts: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!EMAIL_WEBHOOK_URL) return;
  try {
    await fetch(EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
  } catch (e) {
    console.error("[Stripe Webhook] email error", e);
  }
}

export async function POST(req: NextRequest) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      /* ---------------------------------- */
      /* checkout.session.completed         */
      /* ---------------------------------- */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email =
          session.customer_details?.email ||
          (session as any).customer_email ||
          session.metadata?.email ||
          null;

        let stripeCustomerId: string | null =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer as any)?.id ?? null;

        if (!stripeCustomerId && email) {
          const c = await stripe.customers.create({ email });
          stripeCustomerId = c.id;
        }

        if (!email || !stripeCustomerId) break;

        let subId: string | null = null;
        let subStatus: string | null = null;
        let periodEnd: Date | null = null;
        let planCode: string | null = null;

        const sid = (session as any).subscription;
        if (typeof sid === "string") {
          const sub = await stripe.subscriptions.retrieve(sid);
          subId = sid;
          subStatus = sub.status;
          if (typeof (sub as any).current_period_end === "number") {
            periodEnd = new Date((sub as any).current_period_end * 1000);
          }
          planCode = (sub as any).items?.data?.[0]?.price?.id ?? null;
        }

        await db.query(
          `
          INSERT INTO tenants
            (email, stripe_customer_id, stripe_subscription_id,
             subscription_status, current_period_end, plan_code, autopilot_enabled)
          VALUES ($1,$2,$3,$4,$5,$6,true)
          ON CONFLICT (email) DO UPDATE
            SET stripe_customer_id = EXCLUDED.stripe_customer_id,
                stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                subscription_status = EXCLUDED.subscription_status,
                current_period_end = EXCLUDED.current_period_end,
                plan_code = EXCLUDED.plan_code,
                autopilot_enabled = true;
          `,
          [email, stripeCustomerId, subId, subStatus, periodEnd, planCode]
        );

        await sendNotificationEmail({
          to: email,
          subject: "Cerbero AI – Autotrading attivato",
          text: "Il tuo abbonamento Cerbero Autopilot è attivo.",
        });

        break;
      }

      /* ---------------------------------- */
      /* invoice.upcoming                   */
      /* ---------------------------------- */
      case "invoice.upcoming": {
        const invoice = event.data.object as Stripe.Invoice;

        let email = invoice.customer_email || null;
        const stripeCustomerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer as any)?.id;

        if (!email && stripeCustomerId) {
          const r = await db.query(
            "SELECT email FROM tenants WHERE stripe_customer_id = $1 LIMIT 1",
            [stripeCustomerId]
          );
          email = r.rowCount ? r.rows[0].email : null;
        }

        if (!email && stripeCustomerId) {
          const c = await stripe.customers.retrieve(stripeCustomerId);
          email = (c as any)?.email ?? null;
        }

        if (!email) break;

        await sendNotificationEmail({
          to: email,
          subject: "Cerbero AI – Rinnovo imminente",
          text: "Il tuo abbonamento Cerbero si rinnoverà a breve.",
        });

        break;
      }

      /* ---------------------------------- */
      /* invoice.payment_failed             */
      /* ---------------------------------- */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        let email = invoice.customer_email || null;
        const stripeCustomerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer as any)?.id;

        if (!email && stripeCustomerId) {
          const r = await db.query(
            "SELECT email FROM tenants WHERE stripe_customer_id = $1 LIMIT 1",
            [stripeCustomerId]
          );
          email = r.rowCount ? r.rows[0].email : null;
        }

        if (!email && stripeCustomerId) {
          const c = await stripe.customers.retrieve(stripeCustomerId);
          email = (c as any)?.email ?? null;
        }

        if (stripeCustomerId && !isFounder((email || "").toLowerCase())) {
          await db.query(
            "UPDATE tenants SET autopilot_enabled = false WHERE stripe_customer_id = $1",
            [stripeCustomerId]
          );
        }

        if (email) {
          await sendNotificationEmail({
            to: email,
            subject: "Cerbero AI – Pagamento non riuscito",
            text:
              "Il pagamento non è andato a buon fine. Autopilot è stato messo in pausa.",
          });
        }

        break;
      }

      /* ---------------------------------- */
      /* subscription.updated / deleted     */
      /* ---------------------------------- */
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeCustomerId =
          typeof sub.customer === "string"
            ? sub.customer
            : (sub.customer as any)?.id;

        if (!stripeCustomerId) break;

        if (
          ["canceled", "unpaid", "past_due", "incomplete_expired"].includes(
            sub.status
          )
        ) {
          const r = await db.query(
            "SELECT email FROM tenants WHERE stripe_customer_id = $1 LIMIT 1",
            [stripeCustomerId]
          );
          const email = r.rowCount ? r.rows[0].email : "";

          if (!isFounder(email.toLowerCase())) {
            await db.query(
              "UPDATE tenants SET autopilot_enabled = false WHERE stripe_customer_id = $1",
              [stripeCustomerId]
            );
          }
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[Stripe Webhook] handler error", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
