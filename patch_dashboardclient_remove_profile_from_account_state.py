#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
from datetime import datetime
import re
import sys

TARGET = Path("app/dashboard/DashboardClient.tsx")

REMOVE_PATTERNS = [
    r"setProfileEmail\(",
    r"setSubscriptionFounder\(",
    r"setSubscriptionActive\(",
    r"setSubscriptionStatus\(",
    r"setSubscriptionPeriodEnd\(",
]

def main() -> int:
    if not TARGET.exists():
        print(f"ERROR: missing {TARGET}")
        return 2

    src = TARGET.read_text(encoding="utf-8")
    backup = TARGET.with_suffix(TARGET.suffix + f".bak_rm_profile_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    backup.write_text(src, encoding="utf-8")

    lines = src.splitlines(True)

    # Individua il primo blocco che fetch-a '/api/dashboard/account-state'
    # e rimuove SOLO le righe "setProfileEmail / setSubscription*" dentro quel blocco.
    out = []
    in_account_state_block = False
    removed = 0

    # euristica: entriamo nel blocco dopo aver visto la stringa dell'endpoint,
    # e usciamo quando finisce il try/catch o quando incontriamo il secondo fetch di overview.
    for i, line in enumerate(lines):
        if "/api/dashboard/account-state" in line:
            in_account_state_block = True

        # se arriva il fetch overview, usciamo dal blocco account-state
        if in_account_state_block and "/api/dashboard/overview" in line:
            in_account_state_block = False

        if in_account_state_block:
            # rimuovi le righe che matchano i pattern
            if any(re.search(p, line) for p in REMOVE_PATTERNS):
                removed += 1
                continue

        out.append(line)

    if removed == 0:
        print("ERROR: nothing removed (patterns not found in account-state block)")
        print(f"Backup: {backup}")
        return 3

    TARGET.write_text("".join(out), encoding="utf-8")
    print(f"OK: removed {removed} profile/subscription setters from account-state loader")
    print(f"Backup: {backup}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
