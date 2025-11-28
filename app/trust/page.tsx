"use client";
import Link from "next/link";

/* ——————————————————————————————————————
   Data sections
—————————————————————————————————————— */

const faq = [
  {
    id: "01",
    title: "I fondi sono bloccati?",
    subtitle: "No. Restano sempre nel tuo smart contract personale.",
    bullets: [
      "Il capitale è sempre nel tuo contratto 1-a-1 su Arbitrum One.",
      "Nessun conto omnibus, niente fondi condivisi.",
      "Puoi richiedere prelievo quando vuoi (flusso: SC → USDC → banca).",
    ],
  },
  {
    id: "02",
    title: "Potete scappare con la cassa?",
    subtitle:
      "No. Cerbero ha il telecomando, non le chiavi della cassaforte.",
    bullets: [
      "Non possiamo inviare i fondi a indirizzi arbitrari.",
      "Ruolo limitato: esecuzione strategie + controllo rischio.",
      "Tutto verificabile da blockchain explorer.",
    ],
  },
  {
    id: "03",
    title: "Posso perdere tutto?",
    subtitle:
      "Il trading comporta rischio, ma la Coscienza AI usa scudi sempre attivi.",
    bullets: [
      "Stop-loss, limiti rischio e protezioni integrate 24/7.",
      "Autopilot ON/OFF sempre sotto il tuo controllo.",
      "Nessuna promessa di rendimento: trasparenza prima di tutto.",
    ],
  },
];

const pillars = [
  {
    title: "Capitale sempre tuo",
    items: [
      "Smart contract dedicato 1-a-1, nessun conto di terzi.",
      "Saldo, movimenti e operazioni sempre verificabili.",
      "Puoi mettere in pausa l’autotrading quando vuoi.",
    ],
  },
  {
    title: "Rischi chiari, zero fumo",
    items: [
      "In onboarding firmi un contratto cristallino.",
      "Zero clausole nascoste.",
      "Gestione rischio sempre sotto il tuo controllo.",
    ],
  },
  {
    title: "Tecnologia verificabile",
    items: [
      "Google Cloud per sicurezza e stabilità.",
      "Arbitrum One + USDC native per transazioni veloci e sicure.",
      "Strategie gestite da smart contract + modelli AI osservabili.",
    ],
  },
];

/* ——————————————————————————————————————
   Component
—————————————————————————————————————— */

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-cerbero-trust text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-24">

        {/* HERO */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center rounded-full bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            TRUST &amp; SICUREZZA
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            Sicurezza prima di tutto.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-white/70">
            Cerbero è progettato per una cosa sola: permetterti di usare
            l’autotrading AI senza mai cedere il controllo del tuo capitale.
          </p>
        </section>

        {/* 3 FAQ */}
        <section className="grid gap-6 md:grid-cols-3 mb-28">
          {faq.map((q) => (
            <div
              key={q.id}
              className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px]">
                  {q.id}
                </span>
                <span>{q.title}</span>
              </div>

              <h3 className="text-sm md:text-base font-semibold mb-2">
                {q.title}
              </h3>
              <p className="text-xs md:text-sm text-white/80 mb-3">
                {q.subtitle}
              </p>

              <ul className="space-y-1.5 text-xs md:text-[13px] text-white/70">
                {q.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 h-1 w-1 rounded-full bg-white/50" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* PILLARS */}
        <section className="rounded-[40px] bg-gradient-to-b from-transparent via-white/5 to-white/80 px-5 sm:px-8 pt-12 pb-16 text-slate-900 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-3">
              Come proteggiamo te e il tuo capitale.
            </h2>
            <p className="text-sm md:text-base text-white/75">
              Cerbero non tocca mai i tuoi soldi. La nostra AI può operare,
              ma non può spostare i fondi fuori dal tuo smart contract.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-3xl bg-white text-slate-900 px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_45px_rgba(15,23,42,0.25)]"
              >
                <h3 className="text-sm md:text-base font-semibold mb-3">
                  {p.title}
                </h3>
                <ul className="space-y-2 text-xs md:text-[13px] text-slate-700">
                  {p.items.map((item, i) => (
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
              Nessuna consulenza finanziaria. Il capitale è sempre nel tuo smart contract.
              Il rischio di mercato resta a tuo carico.
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
