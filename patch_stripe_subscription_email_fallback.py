from pathlib import Path
from datetime import datetime

FILE = Path("app/api/stripe/webhook/route.ts")

def main():
    if not FILE.exists():
        raise SystemExit(f"File not found: {FILE}")

    src = FILE.read_text(encoding="utf-8")

    # We patch ONLY the subscription updated/deleted block.
    # 1) Remove backticks from the query string
    # 2) Wrap DB lookup in try/catch with warning log
    # 3) Add Stripe customer retrieve fallback for email (for founder whitelist logic)
    old_snippet = """          const tRes = await db.query(
            `SELECT email FROM tenants WHERE stripe_customer_id = $1 LIMIT 1;`,
            [stripeCustomerId]
          );
          const email = (tRes.rowCount ? (tRes.rows[0].email as string) : "")
            .toLowerCase()
            .trim();
"""

    new_snippet = """          let email = "";

          // lookup email in DB (best-effort)
          try {
            const tRes = await db.query(
              "SELECT email FROM tenants WHERE stripe_customer_id = $1 LIMIT 1;",
              [stripeCustomerId]
            );
            email = (tRes.rowCount ? String(tRes.rows[0]?.email || "") : "")
              .toLowerCase()
              .trim();
          } catch (e) {
            console.warn("[Stripe Webhook] subscription: db lookup failed", e);
          }

          // fallback: Stripe customer retrieve (best-effort)
          if (!email) {
            try {
              const c = await stripe.customers.retrieve(stripeCustomerId);
              const em = (c as any)?.email;
              email = em ? String(em).toLowerCase().trim() : "";
            } catch (e) {
              console.warn("[Stripe Webhook] subscription: stripe customer retrieve failed", e);
            }
          }
"""

    if old_snippet not in src:
        raise SystemExit("Expected snippet not found. File may have changed; aborting to avoid wrong patch.")

    out = src.replace(old_snippet, new_snippet, 1)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = FILE.with_name(FILE.name + f".bak_sub_email_{ts}")
    bak.write_text(src, encoding="utf-8")
    FILE.write_text(out, encoding="utf-8")

    # sanity
    if "subscription: db lookup failed" not in out or "subscription: stripe customer retrieve failed" not in out:
        raise SystemExit("Patch wrote file but sanity check failed")

    print("OK: patched subscription.updated/deleted email lookup + removed backticks")
    print(f"Backup: {bak}")

if __name__ == "__main__":
    main()
