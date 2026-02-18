#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "app" / "page.tsx"

if not PAGE.exists():
    raise SystemExit("File app/page.tsx non trovato")

code = PAGE.read_text(encoding="utf-8")

# 1️⃣ Titolo Hero
code, n1 = re.subn(
    r"Collega Cerbero: l’AI Trading Agent per il tuo MT5",
    "Cerbero: AI Agent per il Trading",
    code
)

if n1 != 1:
    raise SystemExit("Titolo Hero non trovato o già modificato")

# 2️⃣ Step 2 titolo
code, n2 = re.subn(
    r"2\. Collega MT5",
    "2. Collega conto broker",
    code
)

if n2 != 1:
    raise SystemExit("Titolo Step 2 non trovato")

# 3️⃣ Step 2 sottotitolo
code, n3 = re.subn(
    r"Inserisci le credenziali del tuo broker\. Connessione criptata via MetaApi\.",
    "Collega un conto broker compatibile con MetaTrader 5 (o MetaTrader 4). Connessione criptata via MetaApi.",
    code
)

if n3 != 1:
    raise SystemExit("Sottotitolo Step 2 non trovato")

PAGE.write_text(code, encoding="utf-8")

print("✅ Patch applicata correttamente.")
