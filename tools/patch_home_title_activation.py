from pathlib import Path

path = Path("app/page.tsx")
content = path.read_text(encoding="utf-8")

# --- PATCH TITOLO HERO ---

content = content.replace(
    "Collega Cerbero:",
    "Cerbero:"
)

content = content.replace(
    "l’AI Trading Agent per il tuo MT5",
    "AI Agent per il Trading"
)

# --- PATCH STEP 2 ATTIVAZIONE ---

content = content.replace(
    "2. Collega MT5",
    "2. Collega conto broker"
)

content = content.replace(
    "Inserisci le credenziali del tuo broker. Connessione criptata via MetaApi.",
    "Collega un conto broker compatibile con MetaTrader 5 (o MetaTrader 4). Connessione criptata via MetaApi."
)

path.write_text(content, encoding="utf-8")

print("✅ Patch titolo + attivazione completata.")
