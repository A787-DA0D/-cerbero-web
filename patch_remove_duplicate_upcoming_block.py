from pathlib import Path
from datetime import datetime

p = Path("app/api/stripe/webhook/route.ts")
src = p.read_text(encoding="utf-8")

backup = p.with_suffix(p.suffix + f".bak_dup_upcoming_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
backup.write_text(src, encoding="utf-8")

lines = src.splitlines(True)

# Rimuoviamo il blocco duplicato che inizia subito dopo il "break;" del case invoice.upcoming
# Pattern atteso (dal tuo output):
#   break;
# }
#
#   await sendNotificationEmail({ ... });
#   console.log(...);
#   break;
# }
out = []
i = 0
removed = 0

while i < len(lines):
    # Individua la sequenza sospetta: chiusura del case + blocco duplicato "await sendNotificationEmail" subito dopo
    if (
        i + 5 < len(lines)
        and "break;" in lines[i]
        and lines[i+1].strip() == "}"
        and lines[i+2].strip() == ""
        and "await sendNotificationEmail" in lines[i+3]
    ):
        # Tenta di saltare fino alla prossima riga che chiude il blocco duplicato con "}" dopo un "break;"
        j = i + 3
        while j < len(lines):
            if lines[j].strip() == "break;" and (j + 1) < len(lines) and lines[j+1].strip() == "}":
                # rimuovi anche la riga "}" successiva al break
                j = j + 2
                removed += 1
                break
            j += 1

        if removed:
            # manteniamo solo la parte valida (break + } + blank già aggiunti)
            out.append(lines[i])
            out.append(lines[i+1])
            out.append(lines[i+2])
            i = j
            continue

    out.append(lines[i])
    i += 1

if not removed:
    raise SystemExit("ERROR: duplicate upcoming block not found (no changes applied)")

p.write_text("".join(out), encoding="utf-8")
print("OK: removed duplicate invoice.upcoming stray block")
print(f"Backup: {backup}")
