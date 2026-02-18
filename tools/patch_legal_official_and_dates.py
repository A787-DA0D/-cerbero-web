#!/usr/bin/env python3
from __future__ import annotations

import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TODAY = date.today()
DATE_IT = TODAY.strftime("%d/%m/%Y")
DATE_ISO = TODAY.strftime("%Y-%m-%d")

LEGAL_FILES = [
    ROOT / "app/legal/privacy/page.tsx",
    ROOT / "app/legal/cookies/page.tsx",
    ROOT / "app/legal/terms/page.tsx",
    ROOT / "app/legal/risk/page.tsx",
]
OFFICIAL_FILE = ROOT / "app/legal/official/page.tsx"


def patch_dates(p: Path) -> bool:
    if not p.exists():
        return False

    s = p.read_text(encoding="utf-8")
    orig = s

    # Common placeholders
    s = s.replace("DD/MM/YYYY", DATE_IT)

    # If they used English "Last updated:" with placeholder, ensure ISO format
    s = re.sub(
        r"(Last\s+updated:\s*)(\d{2}/\d{2}/\d{4}|DD/MM/YYYY)",
        rf"\\1{DATE_ISO}",
        s,
        flags=re.IGNORECASE,
    )

    # If they used Italian label, ensure Italian format
    s = re.sub(
        r"(Ultimo\s+aggiornamento:\s*)(\d{4}-\d{2}-\d{2}|DD/MM/YYYY)",
        rf"\\1{DATE_IT}",
        s,
        flags=re.IGNORECASE,
    )

    if s != orig:
        p.write_text(s, encoding="utf-8")
        return True
    return False


def patch_official_dark(p: Path) -> bool:
    if not p.exists():
        return False

    s = p.read_text(encoding="utf-8")
    orig = s

    # 1) Force main container to match other legal pages (dark)
    s = re.sub(
        r'<main\s+className="[^"]*">',
        '<main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-10 py-10">',
        s,
        count=1,
    )

    # 2) Make sure outer content wrapper is consistent (best-effort)
    s = re.sub(
        r'<div\s+className="[^"]*max-w-3xl[^"]*">',
        '<div className="mx-auto max-w-3xl space-y-6">',
        s,
        count=1,
    )

    # 3) Best-effort text color normalization (avoid harsh whites everywhere)
    #    Only replace typical light-theme slate colors.
    replacements = [
        ("text-slate-900", "text-white"),
        ("text-slate-800", "text-white"),
        ("text-slate-700", "text-white/90"),
        ("text-slate-600", "text-white/80"),
        ("text-slate-500", "text-white/70"),
        ("text-slate-400", "text-white/60"),
        ("bg-white", "bg-slate-950"),
        ("bg-slate-50", "bg-slate-950"),
        ("border-slate-200", "border-white/10"),
        ("border-slate-300", "border-white/10"),
    ]
    for a, b in replacements:
        s = s.replace(a, b)

    if s != orig:
        p.write_text(s, encoding="utf-8")
        return True
    return False


def main():
    changed = False

    # Patch dates
    for f in LEGAL_FILES:
        if patch_dates(f):
            print(f"✅ Date aggiornate: {f.relative_to(ROOT)}")
            changed = True

    # Patch official page style
    if patch_official_dark(OFFICIAL_FILE):
        print(f"✅ Documento Ufficiale in dark mode: {OFFICIAL_FILE.relative_to(ROOT)}")
        changed = True
    else:
        if OFFICIAL_FILE.exists():
            print("ℹ️ Documento Ufficiale: nessuna modifica necessaria (o struttura diversa).")
        else:
            print("⚠️ Documento Ufficiale non trovato: app/legal/official/page.tsx")

    if not changed:
        print("ℹ️ Nessuna modifica applicata (probabilmente già tutto ok).")


if __name__ == "__main__":
    main()
