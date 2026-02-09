#!/usr/bin/env python3
from __future__ import annotations
import re
from pathlib import Path
from datetime import datetime

FILE = Path("app/api/stripe/webhook/route.ts")

REPL_BLOCK = r'''
      case "invoice.upcoming": {
        const invoice = event.data.object as Stripe.Invoice;

        let customerEmail: string | null = invoice.customer_email || null;

        const stripeCustomerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer as any)?.id;

        // Fallback email: DB via stripe_customer_id -> email
        if (!customerEmail && stripeCustomerId) {
          try {
            const dbRes = await db.query(
              "SELECT email FROM tenants WHERE stripe_customer_id = $1 LIMIT 1;",
              [stripeCustomerId]
            );
            if (dbRes.rowCount) {
              customerEmail = String(dbRes.rows[0]?.email || "").trim() || null;
            }
          } catch (e) {
            console.warn("[Stripe Webhook] upcoming: db lookup failed", e);
          }
        }

        // Fallback email: Stripe customer retrieve
        if (!customerEmail && stripeCustomerId) {
          try {
            const c = await stripe.customers.retrieve(stripeCustomerId);
            const em = (c as any)?.email;
            customerEmail = em ? String(em).trim() : null;
          } catch (e) {
            console.warn("[Stripe Webhook] upcoming: stripe customer retrieve failed", e);
          }
        }

        if (!customerEmail) {
          console.log(
            "[Stripe Webhook] invoice.upcoming senza email (no customer_email + fallback failed)",
            { stripeCustomerId, invoiceId: (invoice as any)?.id }
          );
          break;
        }

        await sendNotificationEmail({
          to: customerEmail,
          subject: "Cerbero AI – Il tuo abbonamento sta per rinnovarsi",
          text:
            "Il tuo abbonamento Cerbero Autopilot sta per rinnovarsi automaticamente. " +
            "Se non desideri il rinnovo, puoi gestire il piano dal tuo account Stripe / Cerbero.",
        });

        console.log("[Stripe Webhook] invoice.upcoming → reminder inviato", {
          email: customerEmail,
          stripeCustomerId,
        });

        break;
      }
'''.strip("\n")

def main():
    if not FILE.exists():
        raise SystemExit(f"File not found: {FILE}")

    src = FILE.read_text(encoding="utf-8")

    # Match the entire invoice.upcoming case block (non-greedy)
    pat = re.compile(
        r'\n\s*case\s+"invoice\.upcoming"\s*:\s*\{.*?\n\s*break;\n\s*\}\n',
        re.DOTALL
    )

    m = pat.search(src)
    if not m:
        raise SystemExit('Could not find block: case "invoice.upcoming": { ... }')

    out = src[:m.start()] + "\n" + REPL_BLOCK + "\n" + src[m.end():]

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = FILE.with_name(FILE.name + f".bak_upcoming_{ts}")
    bak.write_text(src, encoding="utf-8")
    FILE.write_text(out, encoding="utf-8")

    # quick sanity check
    if 'case "invoice.upcoming"' not in out or "upcoming: db lookup failed" not in out:
        raise SystemExit("Patch wrote file but sanity check failed")

    print(f"OK: patched invoice.upcoming fallback email")
    print(f"Backup: {bak}")

if __name__ == "__main__":
    main()
