from pathlib import Path
import re
from datetime import datetime

path = Path("app/dashboard/DashboardClient.tsx")
s = path.read_text(encoding="utf-8")

bak = path.with_suffix(path.suffix + f".bak_move_sub_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
bak.write_text(s, encoding="utf-8")

# 1) RIMUOVI dal loader account-state (il blocco comment + 5 setter)
rm_pat = re.compile(
    r"\n\s*// profile \+ subscription \(da /api/dashboard/overview\)\n"
    r"\s*setProfileEmail\(.*?\);\n"
    r"\s*setSubscriptionFounder\(.*?\);\n"
    r"\s*setSubscriptionActive\(.*?\);\n"
    r"\s*setSubscriptionStatus\(.*?\);\n"
    r"\s*setSubscriptionPeriodEnd\(.*?\);\n",
    re.DOTALL
)
s2, n = rm_pat.subn("\n", s, count=1)
if n != 1:
    raise SystemExit(f"ERROR: cannot remove block from account-state loader (found {n})")

# 2) INSERISCI nel loader overview, subito dopo setAutopilot(Boolean(j.autopilot?.enabled));
#    MA SOLO dentro al blocco overview (fetch('/api/dashboard/overview'...))
#    Prendiamo una finestra che contiene fetch overview per essere sicuri.
overview_anchor = re.search(r"fetch\('/api/dashboard/overview'", s2)
if not overview_anchor:
    raise SystemExit("ERROR: cannot find fetch('/api/dashboard/overview')")

# Trova il primo setAutopilot(...) dopo l'anchor overview
needle = re.compile(r"setAutopilot\(Boolean\(j\.autopilot\?\.\s*enabled\)\);\s*")
m = needle.search(s2, pos=overview_anchor.start())
if not m:
    raise SystemExit("ERROR: cannot find setAutopilot(...) in overview loader")

insert = (
    "\n"
    "        // profile + subscription (da /api/dashboard/overview)\n"
    "        setProfileEmail(String(j.profile?.email || '').toLowerCase().trim());\n"
    "        setSubscriptionFounder(Boolean(j.subscription?.founder));\n"
    "        setSubscriptionActive(Boolean(j.subscription?.active));\n"
    "        setSubscriptionStatus((j.subscription?.status ?? null) as any);\n"
    "        setSubscriptionPeriodEnd((j.subscription?.currentPeriodEnd ?? null) as any);\n"
)

s3 = s2[:m.end()] + insert + s2[m.end():]

path.write_text(s3, encoding="utf-8")
print("OK: moved profile/subscription setters from account-state loader to overview loader")
print(f"Backup: {bak}")
