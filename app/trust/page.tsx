import Link from "next/link";

const faqs = [
  {
    id: 1,
    label: "Blocco fondi",
    question: "I soldi sono bloccati?",
    answerShort: "No. Puoi richiedere il prelievo in qualsiasi momento.",
    bullets: [
      "I fondi sono sempre nel tuo smart contract 1-a-1.",
      "Il flusso in uscita segue il percorso inverso: smart contract → USDC → conto bancario.",
      "Non esiste un conto omnibus o cassa comune gestita da Cerbero.",
    ],
  },
  {
    id: 2,
    label: "Rischio controparte",
    question: "Potete scappare con la cassa?",
    answerShort:
      "No. Il contratto è intestato a te e definisce regole precise su cosa può fare Cerbero.",
    bullets: [
      "Non possiamo trasferire i fondi verso wallet arbitrari.",
      "Gestiamo solo l’esecuzione delle strategie e il controllo del rischio.",
      "Puoi verificare indirizzi e movimenti sul tuo blockchain explorer.",
    ],
  },
  {
    id: 3,
    label: "Rischio di mercato",
    question: "Posso perdere tutto?",
    answerShort:
      "Il trading ha sempre rischio. La Coscienza AI usa scudi, non magie.",
    bullets: [
      "Stop loss, limiti di rischio e logiche di protezione sono sempre attivi.",
      "Puoi mettere in pausa l’autotrading in qualsiasi momento.",
      "Nessuna promessa di rendimento, solo gestione del rischio trasparente.",
    ],
  },
];

const pillars = [
  {
    title: "Sempre sotto il tuo controllo",
    bullets: [
      "I fondi sono sul tuo smart contract 1-a-1, non su un conto di terzi.",
      "Puoi sempre vedere operazioni e saldo dal pannello e, volendo, dallo stesso blockchain explorer.",
      "Nessuna custodia di terze parti non necessaria.",
    ],
  },
  {
    title: "Rischi chiari, niente asterischi",
    bullets: [
      "In fase di onboarding firmi un contratto chiaro con tutti i rischi esplicitati.",
      "Nessuna clausola nascosta in piccolo.",
      "Puoi mettere in pausa l’autotrading in qualunque momento.",
    ],
  },
  {
    title: "Stack tecnico verificabile",
    bullets: [
      "Google Cloud per infrastruttura, sicurezza e osservabilità.",
      "Arbitrum One + USDC native per on-chain.",
      "Strategie eseguite via smart contract e modelli AI osservabili.",
    ],
  },
];

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050816] via-[#050816] to-[#f5f5f5] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        {/* BLOCCO 1 – LE 3 DOMANDE */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center rounded-full bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              TRUST &amp; SICUREZZA
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Le 3 domande che tutti fanno.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-white/70">
              Abbiamo costruito Cerbero per rispondere in modo chiaro a dubbi su
              blocco dei fondi, sicurezza del contratto e rischi reali del
              trading automatizzato.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="relative rounded-3xl border border-white/10 bg-white/5 px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px]">
                    {faq.id}
                  </span>
                  <span>{faq.label}</span>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-xs md:text-sm text-white/80 mb-3">
                  {faq.answerShort}
                </p>
                <ul className="space-y-1.5 text-xs md:text-[13px] text-white/70">
                  {faq.bullets.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-white/50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* BLOCCO 2 – TRASPARENZA */}
        <section className="rounded-[40px] bg-gradient-to-b from-transparent via-white/5 to-white/80 px-5 sm:px-8 pt-12 pb-16 text-slate-900 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-3">
              Trasparenza prima di tutto.
            </h2>
            <p className="text-sm md:text-base text-white/75">
              Cerbero non è una banca, non è un fondo comune e non fa consulenza
              finanziaria personalizzata. È un&apos;infrastruttura tecnologica
              che automatizza strategie di trading su un conto dedicato.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-3xl bg-white text-slate-900 px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_45px_rgba(15,23,42,0.25)]"
              >
                <h3 className="text-sm md:text-base font-semibold mb-3">
                  {pillar.title}
                </h3>
                <ul className="space-y-2 text-xs md:text-[13px] text-slate-700">
                  {pillar.bullets.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[11px] md:text-xs text-slate-600">
              Nessuna consulenza finanziaria. Il capitale è sempre nel tuo smart
              contract. Il rischio di mercato resta a tuo carico.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.55)] hover:bg-slate-800 transition"
            >
              Vai ai piani
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
