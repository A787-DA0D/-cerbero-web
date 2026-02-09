#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import re

p = Path("app/api/autopilot/toggle/route.ts")
s = p.read_text(encoding="utf-8")

ts = datetime.now().strftime("%Y%m%d_%H%M%S")
bak = p.with_suffix(p.suffix + f".bak_disable_notify_{ts}")
bak.write_text(s, encoding="utf-8")

# 1) Short-circuit notifyCoordinator at top of function
pattern = r"async function notifyCoordinator\((.*?)\)\s*\{\n"
m = re.search(pattern, s)
if not m:
    raise SystemExit("ERROR: notifyCoordinator() not found")

# insert after function open brace
idx = m.end()
insert = '  // NOTE: Coordinator notify disabled (web -> coordinator). DB + coordinator gate is source of truth.\n' \
         '  return;\n\n'
s2 = s[:idx] + insert + s[idx:]

p.write_text(s2, encoding="utf-8")
print("OK: disabled notifyCoordinator (no more 404 / latency)")
print(f"Backup: {bak}")
