from pathlib import Path
import re
from datetime import datetime

path = Path("app/dashboard/DashboardClient.tsx")
s = path.read_text(encoding="utf-8")

bak = path.with_suffix(path.suffix + f".bak_overview_sub_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
bak.write_text(s, encoding="utf-8")

# Trova il punto giusto: dopo setAutopilot(Boolean(j.autopilot?.enabled));
needle = r"setAutopilot\(Boolean\(j\.autopilot\?\.\s*enabled\)\);\s*"
m = re.search(needle, s)
if not m:
    raise SystemExit("ERROR: cannot find setAutopilot(...) in overview loader")

insert = (
    "        // profile + subscription (da /api/dashboard/overview)\n"
    "        setProfileEmail(String(j.profile?.email || '').toLowerCase().trim());\n"
    "        setSubscriptionFounder(Boolean(j.subscription?.founder));\n"
    "        setSubscriptionActive(Boolean(j.subscription?.active));\n"
    "        setSubscriptionStatus((j.subscription?.status ?? null) as any);\n"
    "        setSubscriptionPeriodEnd((j.subscription?.currentPeriodEnd ?? null) as any);\n\n"
)

# Inserisci subito dopo setAutopilot(...)
s2 = s[:m.end()] + "\n" + insert + s[m.end():]

path.write_text(s2, encoding="utf-8")
print("OK: patched DashboardClient overview loader (profileEmail + subscription setters)")
print(f"Backup: {bak}")
