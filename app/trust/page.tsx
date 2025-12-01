"use client";

import React, { useState } from "react";
import Image from "next/image";

// --------------------------- NAVBAR ---------------------------

function Nav() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="px-4 sm:px-6 lg:px-12 pt-5 pb-4">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/15 bg-black/70 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_18px_60px_rgba(0,0,0,0.75)]">
        {/* Logo + nome */}
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

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm md:text-base font-semibold">
          <a href="/" className="text-white/70 hover:text-white transition">
            Home
          </a>
          <a href="/pricing" className="text-white/70 hover:text-white transition">
            Pricing
          </a>
          <span className="text-white">Come funziona</span>
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/signup"
            className="inline-flex items-center rounded-full border border-white/30 bg-white/5 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Registrati
          </a>
          <a
            href="/login"
            className="inline-flex items-center rounded-full bg-white text-slate-900 text-xs md:text-sm font-semibold px-4 py-2 shadow-[0_10px_35px_rgba(15,23,42,0.9)] hover:bg-slate-100 transition"
          >
            Accedi
          </a>
        </div>

        {/* Trigger menu mobile (3 puntini) */}
        <button
          type="button"
          className="md:hidden inline-flex flex-col items-center justify-center rounded-full border border-white/30 bg-black/60 p-2 active:scale-95 transition"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label="Apri menu di navigazione"
        >
          <span className="h-1 w-1 rounded-full bg-white mb-0.5" />
          <span className="h-1 w-1 rounded-full bg-white mb-0.5" />
          <span className="h-1 w-1 rounded-full bg-white" />
        </button>
      </div>

      {/* MENU MOBILE */}
      {isMobileOpen && (
        <nav className="md:hidden mt-3 mx-auto max-w-6xl rounded-3xl border border-white/15 bg-black/85 backdrop-blur-2xl px-4 py-4 space-y-3 text-sm text-white/90 shadow-[0_18px_60px_rgba(0,0,0,0.75)]">
          <a
            href="/"
            className="block px-2 py-2 rounded-xl hover:bg-white/10 font-semibold"
            onClick={() => setIsMobileOpen(false)}
          >
            Home
          </a>
          <a
            href="/pricing"
            className="block px-2 py-2 rounded-xl hover:bg-white/10 font-semibold"
            onClick={() => setIsMobileOpen(false)}
          >
            Pricing
          </a>
          <a
            href="/trust"
            className="block px-2 py-2 rounded-xl bg-white/5 font-semibold"
            onClick={() => setIsMobileOpen(false)}
          >
            Come funziona
          </a>

          <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-2">
            <a
              href="/signup"
              className="w-full inline-flex justify-center rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
              onClick={() => setIsMobileOpen(false)}
            >
              Registrati
            </a>
            <a
              href="/login"
              className="w-full inline-flex justify-center rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition"
              onClick={() => setIsMobileOpen(false)}
            >
              Accedi
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

// --------------------------- FOOTER ---------------------------

function Footer() {
  return (
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
  );
}

// --------------------------- PAGE ---------------------------

export default function TrustPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      {/* VIDEO DI SFONDO */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/trust-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* OVERLAY LEGGERO */}
      <div className="absolute inset-0 bg-black/40" />

      {/* CONTENUTO */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav />

        {/* SEZIONE: Come funziona + perché è diversa */}
        <section className="px-4 sm:px-6 lg:px-12 pb-20">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Titolo + sottotitolo */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-semibold">
                Come funziona <span className="text-sky-400">Cerbero AI</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/80 font-semibold max-w-2xl mx-auto">
                In pratica: attivi Cerbero una volta, noi creiamo il tuo
                portafoglio digitale personale e controlli tutto dalla dashboard.
              </p>
            </div>

            {/* CARD UNICA: 3 step + spiegazione + CTA */}
            <div className="rounded-[28px] border border-white/15 bg-black/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_28px_100px_rgba(0,0,0,0.9)] space-y-8">
              {/* TRE STEP */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* STEP 1 */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.22em] text-white/50 font-semibold">
                    STEP 1
                  </h3>
                  <p className="mt-1 text-sm md:text-[15px] font-semibold text-sky-300">
                    Registrazione in pochi minuti
                  </p>
                  <p className="mt-1 text-sm md:text-[15px] text-white/85 font-semibold">
                    Inserisci la tua email, confermi il link e il tuo{" "}
                    <span className="text-sky-300">
                      portafoglio digitale personale
                    </span>{" "}
                    viene creato automaticamente.
                  </p>
                </div>

                {/* STEP 2 */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.22em] text-white/50 font-semibold">
                    STEP 2
                  </h3>
                  <p className="mt-1 text-sm md:text-[15px] font-semibold text-sky-300">
                    Carichi i primi fondi
                  </p>
                  <p className="mt-1 text-sm md:text-[15px] text-white/85 font-semibold">
                    Dalla{" "}
                    <span className="text-sky-300">dashboard</span> ricarichi in
                    pochi click, usando il metodo di pagamento che preferisci.
                    I fondi arrivano nel tuo{" "}
                    <span className="text-sky-300">
                      portafoglio digitale personale
                    </span>
                    .
                  </p>
                </div>

                {/* STEP 3 */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.22em] text-white/50 font-semibold">
                    STEP 3
                  </h3>
                  <p className="mt-1 text-sm md:text-[15px] font-semibold text-sky-300">
                    Attivi l&apos;Autopilot
                  </p>
                  <p className="mt-1 text-sm md:text-[15px] text-white/85 font-semibold">
                    Accendi l&apos;Autopilot e la{" "}
                    <span className="text-sky-300">Coscienza AI</span> inizia a
                    operare 24/7. Dalla dashboard vedi saldo, movimenti,
                    risultati e puoi mettere in pausa o prelevare in qualsiasi
                    momento.
                  </p>
                </div>
              </div>

              {/* TESTO: cosa rende Cerbero diverso */}
              <div className="pt-4 border-t border-white/10 space-y-3 text-sm md:text-[15px] text-white/85 font-semibold">
                <p>
                  Cerbero AI non è un bot tradizionale: è un sistema
                  professionale di{" "}
                  <span className="text-sky-300">
                    tre Intelligenze Artificiali coordinate
                  </span>{" "}
                  sotto un&apos;unica Coscienza, progettata per analizzare i
                  mercati, prendere decisioni operative e proteggere il
                  capitale come farebbe un desk di trading avanzato.
                </p>
                <p>
                  Ogni utente ha un{" "}
                  <span className="text-sky-300">
                    portafoglio digitale personale
                  </span>
                  , separato e verificabile on-chain. La Coscienza AI opera in
                  autonomia 24/7, riducendo il rumore dei mercati, mantenendo
                  disciplina nelle decisioni e applicando un{" "}
                  <span className="text-sky-300">
                    risk management ispirato agli hedge fund
                  </span>
                  .
                </p>
                <p>
                  Il risultato è semplice: un sistema che lavora con precisione,
                  continuità e controllo — mentre tu vivi la tua vita.
                </p>
              </div>

              {/* CTA FINALI */}
              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold shadow-[0_22px_60px_rgba(15,23,42,0.9)] hover:bg-slate-100 transition"
                >
                  Registrati e attiva Autopilot
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Vedi il prezzo 99€/mese
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
