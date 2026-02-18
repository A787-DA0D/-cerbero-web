from pathlib import Path
import re

path = Path("app/page.tsx")
s = path.read_text(encoding="utf-8")
Path("app/page.tsx.bak_glow").write_text(s, encoding="utf-8")

# Cerca l'h1 del Hero e aggiunge un "glow" al testo "Cerbero:"
# Assunzione: hai già "Cerbero:" dentro <h1 ...> ... (linee che includevano "Cerbero:")
if "Cerbero:" not in s:
  print("❌ 'Cerbero:' non trovato in app/page.tsx (già cambiato o diverso).")
  raise SystemExit(1)

# Sostituisce solo la PRIMA occorrenza "Cerbero:" nel blocco Hero aggiungendo uno span con glow.
# Glow: testo gradient + drop-shadow + pseudo alone con blur.
replacement = (
  "<span className=\"relative inline-block\">"
  "<span className=\"absolute -inset-x-4 -inset-y-2 rounded-full "
  "bg-gradient-to-r from-cyan-400/25 via-fuchsia-400/25 to-indigo-400/25 "
  "blur-2xl\" aria-hidden=\"true\" />"
  "<span className=\"relative bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-500 "
  "bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(236,72,153,0.35)]\">"
  "Cerbero:"
  "</span>"
  "</span>"
)

# Prova a sostituire "Cerbero:" solo come testo semplice (non dentro un'altra stringa)
s2, n = re.subn(r"Cerbero:", replacement, s, count=1)
if n == 0:
  print("❌ Non sono riuscito ad applicare il glow (pattern non matchato).")
  raise SystemExit(1)

path.write_text(s2, encoding="utf-8")
print("✅ Glow applicato a 'Cerbero:' (home Hero).")
