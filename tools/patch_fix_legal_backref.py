#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FILES = [
    ROOT / "app/legal/privacy/page.tsx",
    ROOT / "app/legal/cookies/page.tsx",
    ROOT / "app/legal/terms/page.tsx",
    ROOT / "app/legal/risk/page.tsx",
    ROOT / "app/legal/official/page.tsx",
]

def fix_file(p: Path) -> bool:
    if not p.exists():
        return False
    s = p.read_text(encoding="utf-8")
    orig = s

    # Fix: "Last updated: \12026-02-18"  -> "Last updated: 2026-02-18"
    s = re.sub(r"(Last\s+updated:\s*)\\1(\d{4}-\d{2}-\d{2})", r"\1\2", s, flags=re.IGNORECASE)

    # Fix: "Ultimo aggiornamento: \118/02/2026" -> "Ultimo aggiornamento: 18/02/2026"
    s = re.sub(r"(Ultimo\s+aggiornamento:\s*)\\1(\d{2}/\d{2}/\d{4})", r"\1\2", s, flags=re.IGNORECASE)

    # Fix extra: any stray "\1" right before a date
    s = re.sub(r"\\1(\d{4}-\d{2}-\d{2})", r"\1", s)
    s = re.sub(r"\\1(\d{2}/\d{2}/\d{4})", r"\1", s)

    if s != orig:
        p.write_text(s, encoding="utf-8")
        return True
    return False

def main():
    changed_any = False
    for f in FILES:
        if fix_file(f):
            print(f"✅ Fix \\1 date: {f.relative_to(ROOT)}")
            changed_any = True
    if not changed_any:
        print("ℹ️ Nessun \\1 trovato (già pulito).")

if __name__ == "__main__":
    main()
