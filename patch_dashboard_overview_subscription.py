from pathlib import Path
import re
from datetime import datetime

p = Path("app/api/dashboard/overview/route.ts")
s = p.read_text(encoding="utf-8")

bak = p.with_suffix(p.suffix + f".bak_sub_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}")
bak.write_text(s, encoding="utf-8")

# 1) Inject founder helpers (env-driven) if missing
if "function isFounderEmail" not in s:
    insert_after = 'export const runtime = "nodejs";'
    helper = '''
function getFounderEmails(): Set<string> {
  const raw = (process.env.FOUNDER_EMAILS || "info@cerberoai.com").toLowerCase();
  return new Set(raw.split(",").map(s => s.trim()).filter(Boolean));
}

function isFounderEmail(email: string): boolean {
  return getFounderEmails().has((email || "").toLowerCase().trim());
}

function isSubscriptionActive(status: any): boolean {
  const s = (status || "").toString().toLowerCase();
  return s === "active" || s === "trialing";
}
'''.lstrip("\n")
    s = s.replace(insert_after, insert_after + "\n\n" + helper)

# 2) Expand SELECT to include subscription fields
s = re.sub(
    r"SELECT\s+id,\s*email,\s*autopilot_enabled\s+FROM\s+tenants",
    "SELECT id, email, autopilot_enabled, subscription_status, current_period_end, plan_code, stripe_subscription_id, stripe_customer_id\n       FROM tenants",
    s,
    flags=re.IGNORECASE | re.MULTILINE,
)

# 3) Add subscription block to response if not present
if "subscription:" not in s:
    # find the return NextResponse.json({ ... }) object and inject
    needle = "return NextResponse.json({"
    idx = s.find(needle)
    if idx == -1:
        raise SystemExit("ERROR: cannot find return NextResponse.json({")

    # ensure we have row defined
    if "const row = res.rows[0]" not in s:
        raise SystemExit("ERROR: cannot find row assignment")

    # Insert subscription object right after autopilot block
    s = s.replace(
        "  autopilot: {\n        enabled: Boolean(row.autopilot_enabled),\n      },",
        """  autopilot: {
        enabled: Boolean(row.autopilot_enabled),
      },
      subscription: (() => {
        const founder = isFounderEmail(email);
        const status = (row.subscription_status ?? null) as any;
        const active = founder || isSubscriptionActive(status);
        const periodEnd = row.current_period_end ? new Date(row.current_period_end).toISOString() : null;
        return {
          founder,
          active,
          status,
          currentPeriodEnd: periodEnd,
          planCode: row.plan_code ?? null,
          stripeSubscriptionId: row.stripe_subscription_id ?? null,
          stripeCustomerId: row.stripe_customer_id ?? null,
        };
      })(),"""
    )

p.write_text(s, encoding="utf-8")
print("OK: patched dashboard overview with subscription + founder bypass")
print(f"Backup: {bak}")
