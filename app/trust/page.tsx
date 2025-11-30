"use client";

import Image from "next/image";
import FooterLegal from "@/components/FooterLegal";

export default function TrustPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      {/* VIDEO DI SFONDO (senza velo) */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/trust-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* CONTENUTO */}
      <div className="relative z-10">
        {/* NAVBAR (uguale a Pricing/Home) */}
        <header className="px-4 sm:px-6 lg:px-12 pt-5 pb-4">
          <div className="mx-auto max-w-6xl rounded-3xl border border-white/15 bg-black/70 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_18px_60px_rgba(0,0,0,0.75)]">
            {/* Logo + nome */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3 group">
                <Image
                  src="/branding/cerbero-logo.svg"
                  alt="Cerbero AI logo"
                  width={44}
                  height={44}
                  className="drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
                />
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold">
                    Cerbero <span className="text-sky-400">AI</span>
                  </span>
                  <span className="text-[11px] text-white/60 group-hover:text-white/80 transition">
                    Switch On. Sit back. Relax.
                  </span>
                </div>
              </a>
            </div>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-8 text-sm md:text-base font-semibold">
              <a
                href="/"
                className="text-white/70 hover:text-white transition"
              >
                Home
              </a>
              <a
                href="/pricing"
                className="text-white/70 hover:text-white transition"
              >
                Pricing
              </a>
              <a
                href="/trust"
                className="text-white hover:text-white transition"
              >
                Come funziona
              </a>
            </nav>

            {/* CTA destra */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition"
              >
                Registrati
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-semibold shadow-[0_18px_60px_rgba(0,0,0,0.8)] hover:bg-slate-100 transition"
              >
                Accedi
              </a>
            </div>
          </div>
        </header>

        {/* SEZIONE: COME FUNZIONA CERBERO AI */}
        <section className="px-4 sm:px-6 lg:px-12 pb-16 pt-10">
          {/* Titolo + intro */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Come funziona{" "}
              <span className="text-sky-400">Cerbero AI</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
              Cerbero AI nasce per eliminare la complessità del trading e
              portare nel tuo portafoglio una{" "}
              <span className="font-semibold text-sky-400">
                intelligenza artificiale attiva 24/7
              </span>{" "}
              che opera al posto tuo — sempre con i tuoi fondi sotto il tuo
              controllo.
            </p>
          </div>

          {/* Card unica: step + IA + CTA */}
          <div className="mt-9 mx-auto max-w-5xl">
            <div className="rounded-[32px] bg-black/75 border border-white/18 shadow-[0_40px_160px_rgba(0,0,0,0.95)] backdrop-blur-2xl px-6 py-7 md:px-10 md:py-9 space-y-8">
              {/* STEP 1–3 */}
              <div className="grid gap-5 md:grid-cols-3">
                {/* STEP 1 */}
                <div className="rounded-3xl border border-white/12 bg-white/5 px-4 py-4">
                  <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-2">
                    STEP 1
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-sky-400 mb-2">
                    REGISTRAZIONE IN POCHI MINUTI
                  </h3>
                  <p className="text-xs sm:text-[13px] text-white/80 font-semibold leading-relaxed">
                    Inserisci la tua email, confermi il link che ti inviamo e
                    creiamo il tuo{" "}
                    <span className="text-sky-400">
                      portafoglio digitale personale
                    </span>{" "}
                    collegato a Cerbero AI.
                  </p>
                </div>

                {/* STEP 2 */}
                <div className="rounded-3xl border border-white/12 bg-white/5 px-4 py-4">
                  <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-2">
                    STEP 2
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-sky-400 mb-2">
                    CARICHI I PRIMI FONDI
                  </h3>
                  <p className="text-xs sm:text-[13px] text-white/80 font-semibold leading-relaxed">
                    Ricarichi in pochi click: i fondi vengono convertiti in{" "}
                    <span className="text-sky-400">USDC</span> e inviati al tuo{" "}
                    <span className="text-sky-400">smart contract personale</span>{" "}
                    su Arbitrum One, intestato solo a te.
                  </p>
                </div>

                {/* STEP 3 */}
                <div className="rounded-3xl border border-white/12 bg-white/5 px-4 py-4">
                  <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-2">
                    STEP 3
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-sky-400 mb-2">
                    ATTIVI L’AUTOPILOT E CONTROLLI TUTTO
                  </h3>
                  <p className="text-xs sm:text-[13px] text-white/80 font-semibold leading-relaxed">
                    Attivi l’Autopilot e la{" "}
                    <span className="text-sky-400">Coscienza AI</span> inizia a
                    gestire i mercati per te. Dalla{" "}
                    <span className="text-sky-400">dashboard</span> vedi saldo,
                    movimenti, risultati e puoi mettere in pausa o prelevare
                    quando vuoi.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Sezione: Perché è diversa (3 IA) */}
              <div className="space-y-3">
                <h2 className="text-sm sm:text-base font-semibold">
                  Cosa rende Cerbero AI diversa dal resto
                </h2>
                <p className="text-xs sm:text-[13px] text-white/80">
                  Cerbero AI non è un bot di trading tradizionale: è un{" "}
                  <span className="font-semibold text-sky-400">
                    sistema di tre Intelligenze Artificiali coordinate
                  </span>{" "}
                  che lavorano insieme come un pilota automatico professionale
                  sul tuo portafoglio digitale.
                </p>

                <div className="mt-3 grid gap-4 md:grid-cols-3 text-xs sm:text-[13px] text-white/80">
                  <div className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3">
                    <h3 className="text-[13px] font-semibold mb-1 text-sky-400">
                      🧠 IA #1 — Analisi dei mercati
                    </h3>
                    <p>
                      Analizza trend, volatilità, momentum e condizioni di
                      rischio in tempo reale, 24/7.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3">
                    <h3 className="text-[13px] font-semibold mb-1 text-sky-400">
                      ⚡ IA #2 — Decisione &amp; strategia
                    </h3>
                    <p>
                      Sceglie quando entrare, uscire, ridurre l&apos;esposizione
                      o rimanere neutrale. Si adatta al mercato, non segue
                      pattern fissi da bot.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3">
                    <h3 className="text-[13px] font-semibold mb-1 text-sky-400">
                      🛡️ IA #3 — Risk Guardian
                    </h3>
                    <p>
                      Gestisce limiti di rischio, stop dinamici e protezione del
                      capitale per contenere i drawdown e preservare il tuo
                      portafoglio nel tempo.
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs sm:text-[13px] text-white/80">
                  Il risultato: un sistema che lavora ogni secondo, prende
                  decisioni al posto tuo e ti permette di{" "}
                  <span className="font-semibold text-sky-400">
                    vivere tranquillo mentre il tuo portafoglio lavora
                  </span>
                  . Il capitale resta sempre nel tuo{" "}
                  <span className="font-semibold text-sky-400">
                    smart contract personale
                  </span>{" "}
                  — Cerbero non può spostare fondi.
                </p>
              </div>

              {/* CTA */}
              <div className="pt-3 flex flex-wrap gap-3">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold shadow-[0_22px_60px_rgba(15,23,42,0.9)] hover:bg-slate-100 transition"
                >
                  Registrati e attiva Autopilot
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Vedi il prezzo 99€/mese
                </a>
              </div>
            </div>
          </div>
        </section>

{/* FOOTER (uguale a Pricing/Home) */}
<footer className="mt-16 border-t border-white/10 bg-gradient-to-b from-black/40 via-black/80 to-black/95 px-4 sm:px-6 lg:px-12 py-8">
  <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
    {/* Logo + claim */}
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 flex items-center justify-center">
        <Image 
          src="/branding/cerbero-logo.svg"
          alt="Cerbero AI logo"
          width={40}
          height={40}
          className="object-contain drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">
          Cerbero <span className="text-sky-400">AI</span>
        </span>
        <span className="text-[11px] text-white/60">
          © 2025 Cerbero. All rights reserved.
        </span>  
      </div>
    </div>
          
    {/* Powered by + legal */}
    <div className="flex flex-col items-center md:items-end gap-4">
 
      <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 text-[11px] text-white/60">
        <span className="uppercase tracking-[0.18em] text-[10px] text-white/40">
          Powered by
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          Google Cloud
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          Arbitrum One
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          USDC (Circle)
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          Gains Network (GNS)
        </span>
      </div>
        
      <div className="flex flex-wrap justify-center md:justify-end gap-4 text-[11px] text-white/60">
        <a href="/legal/privacy" className="hover:text-white transition">
          Privacy
        </a>
        <a href="/legal/terms" className="hover:text-white transition">
          Termini &amp; Condizioni
        </a>
        <a href="/legal/cookies" className="hover:text-white transition">
          Cookie
        </a>
      </div>
          
    </div>
  </div>
</footer>
      </div>
    </main>
  );
}
