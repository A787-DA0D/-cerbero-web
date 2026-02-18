from pathlib import Path
import re

path = Path("app/page.tsx")
s = path.read_text(encoding="utf-8")
Path("app/page.tsx.bak_fix_legale").write_text(s, encoding="utf-8")

# Trova il blocco "Legale" nel footer e rimpiazza SOLO la <ul> con contenuto valido.
pattern = re.compile(
    r'(<h4 className="font-bold text-slate-900 mb-4 text-sm">Legale</h4>\s*)'
    r'(<ul[\s\S]*?</ul>)',
    re.M
)

m = pattern.search(s)
if not m:
    print("❌ Blocco 'Legale' nel footer non trovato. Non applico patch.")
    raise SystemExit(1)

new_ul = """<ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link href="/legal/privacy" className="hover:text-indigo-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-indigo-600 transition">
                  Termini &amp; Rischi
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-indigo-600 transition">
                  Cookie
                </Link>
              </li>
              <li>
                <Link href="/legal/official" className="hover:text-indigo-600 transition">
                  Documento Ufficiale
                </Link>
              </li>
            </ul>"""

s2 = pattern.sub(rf"\1{new_ul}", s, count=1)

path.write_text(s2, encoding="utf-8")
print("✅ Footer 'Legale' sistemato (JSX valido) + Risk link rimosso.")
