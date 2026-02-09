#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import re

p = Path("app/api/autopilot/toggle/route.ts")
s = p.read_text(encoding="utf-8")

ts = datetime.now().strftime("%Y%m%d_%H%M%S")
bak = p.with_suffix(p.suffix + f".bak_enable_notify_{ts}")
bak.write_text(s, encoding="utf-8")

# Remove the early return we inserted
# We remove the exact injected snippet if present.
snippet = (
  "  // NOTE: Coordinator notify disabled (web -> coordinator). DB + coordinator gate is source of truth.\\n"
  "  return;\\n\\n"
)

if snippet in s:
    s = s.replace(snippet, "", 1)
    p.write_text(s, encoding="utf-8")
    print("OK: re-enabled notifyCoordinator (removed early return)")
    print(f"Backup: {bak}")
else:
    print("OK: notifyCoordinator already enabled (no early return found)")
    print(f"Backup: {bak}")
