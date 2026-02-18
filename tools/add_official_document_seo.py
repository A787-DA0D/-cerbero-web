from pathlib import Path

# 1) Crea pagina documento ufficiale
doc_path = Path("app/legal/official/page.tsx")
doc_path.parent.mkdir(parents=True, exist_ok=True)

doc = """export const metadata = {
  title: "Documento Ufficiale — Cerbero AI",
  description:
    "Cos’è Cerbero AI: software (SaaS) di trading automatizzato per conti MetaTrader 5/4 via MetaApi. Non custodial: i fondi restano sul tuo broker.",
};

export default function OfficialDocumentPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 px-4 sm:px-6 lg:px-10 py-12">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            Documento Ufficiale
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Cos’è Cerbero AI
          </h1>
          <p className="text-slate-600">
            Cerbero AI è un servizio software (SaaS) che automatizza l’esecuzione di operazioni di trading su conti
            broker compatibili con MetaTrader 5 (o MetaTrader 4), tramite integrazione MetaApi.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">1) Cosa fa</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Analizza segnali e condizioni di mercato e genera intenti operativi.</li>
            <li>Esegue automaticamente operazioni sul tuo conto MT5/MT4 collegato (apertura/chiusura posizioni).</li>
            <li>Applica controlli di rischio e vincoli operativi prima di qualsiasi esecuzione.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2) Non-custodial: i fondi restano tuoi</h2>
          <p className="text-slate-700">
            Cerbero AI non detiene e non custodisce fondi dell’utente. I capitali rimangono sul broker. Cerbero opera
            solo con permessi di trading (nessun prelievo).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3) Architettura e controlli</h2>
          <p className="text-slate-700">
            Il sistema è progettato con separazione dei ruoli: motore decisionale (“cervello”), livello di coordinamento
            e policy di rischio (“governor”), ed esecuzione broker-aware. Ogni operazione può essere bloccata se non
            rispetta requisiti di rischio, contesto o stato del broker.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4) Mercati</h2>
          <p className="text-slate-700">
            Cerbero AI opera su mercati tradizionali disponibili su MT5/MT4 (Forex, Indici, Materie Prime), non su crypto.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">5) Modello economico</h2>
          <p className="text-slate-700">
            Cerbero AI è un servizio a canone fisso: non prende percentuali sui profitti. L’utente mantiene pieno
            controllo e responsabilità delle decisioni e del capitale.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">6) Avvertenza sui rischi</h2>
          <p className="text-slate-700">
            Il trading comporta rischi significativi, inclusa la perdita totale del capitale. Cerbero AI non fornisce
            consulenza finanziaria personalizzata né garantisce risultati.
          </p>
        </section>
      </article>
    </main>
  );
}
"""

doc_path.write_text(doc, encoding="utf-8")
print("✅ Creato: app/legal/official/page.tsx")

# 2) Aggiunge link nel footer in app/page.tsx (se c’è già il blocco Legale)
home_path = Path("app/page.tsx")
s = home_path.read_text(encoding="utf-8")
Path("app/page.tsx.bak_official").write_text(s, encoding="utf-8")

if "/legal/official" in s:
  print("ℹ️ Link Documento Ufficiale già presente in app/page.tsx")
  raise SystemExit(0)

needle = 'Link href="/legal/terms"'
if needle not in s:
  print("❌ Non trovo il blocco footer legale (pattern Link href=\"/legal/terms\"). Inserimento manuale non eseguito.")
  raise SystemExit(1)

insert = """              <li>
                <Link href="/legal/official" className="hover:text-indigo-600 transition">
                  Documento Ufficiale
                </Link>
              </li>
"""

# Inserisce sopra "Termini di Servizio" (prima occorrenza)
s2 = s.replace(needle, insert + "                " + needle, 1)
home_path.write_text(s2, encoding="utf-8")
print("✅ Aggiunto link 'Documento Ufficiale' nel footer (Home).")
