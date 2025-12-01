"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function PricingPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      {/* VIDEO DI SFONDO */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/pricing-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* OVERLAY LEGGERO */}
      <div className="absolute inset-0 bg-black/40" />

      {/* CONTENUTO */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* NAVBAR */}
        <header className="px-4 sm:px-6 lg:px-12 pt-5 pb-4">
          <div className="mx-auto max-w-6xl rounded-3xl border border-white/15 bg-black/70 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-[0_18px_60px_rgba(0,0,0,0.75)]">
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

            {/* Nav DESKTOP */}
            <nav className="hidden md:flex items-center gap-8 text-sm md:text-base font-semibold">
              <a
                href="/"
                className="text-white/70 hover:text-white transition"
              >
                Home
              </a>
              <span className="text-white">Pricing</span>
              <a
                href="/trust"
                className="text-white/70 hover:text-white transition"
              >
                Come funziona
              </a>
            </nav>

            {/* CTA desktop + trigger mobile */}
            <div className="flex items-center gap-3">
              {/* CTA DESKTOP */}
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

              {/* MENU MOBILE – tre puntini */}
              <button
                type="button"
                className="md:hidden inline-flex flex-col items-center justify-center rounded-full border border-white/30 bg-black/60 p-2 active:scale-95 transition"
                onClick={() => setIsMobileOpen((prev) => !prev)}
                aria-label="Apri menu di navigazione"
              >
                <span className="h-1 w-1 rounded-full bg-white mb-0.5" />
                <span className="h-1 w-1 rounded-full bg-white mb-0.5" />
                <span className="h-1 w-1 rounded-full bg-white" />
              </button>
            </div>
          </div>

          {/* MENU MOBILE A TENDINA */}
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
                className="block px-2 py-2 rounded-xl hover:bg-white/10 font-semibold"
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

        {/* HERO + CARD */}
        <section className="flex-1 px-4 sm:px-6 lg:px-12 pb-16 pt-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              Prezzo semplice. Solo Autotrading con Cerbero{" "}
              <span className="text-sky-400"> AI.</span>
            </h1>
          </div>

          {/* CARD PRICING CENTRALE */}
          <div className="mt-10 mx-auto max-w-4xl">
            <div className="rounded-[32px] bg-black/60 border border-white/18 shadow-[0_40px_160px_rgba(0,0,0,0.95)] backdrop-blur-2xl px-6 py-7 md:px-10 md:py-9">
              {/* Badge piano */}
              <div className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-400/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-4">
                Autopilot · Piano unico
              </div>

              {/* Prezzo + testo */}
              <div className="space-y-5 text-left">
                <div>
                  <div className="text-4xl md:text-5xl font-bold">
                    99€{" "}
                    <span className="text-sm font-semibold text-white/80">
                      /mese
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white/80">
                    Nessun vincolo annuale. Puoi disattivare con un click
                    quando vuoi.
                  </div>
                </div>

                {/* Paragrafo principale */}
                <p className="text-sm md:text-base text-white/90 font-semibold">
                  Un solo piano,{" "}
                  <span className="text-sky-300">Autopilot 99€/mese</span>.
                  Creiamo il tuo{" "}
                  <span className="text-sky-300">
                    portafoglio digitale personale
                  </span>{" "}
                  e la Coscienza AI gestisce i mercati per te. Tu vedi tutto
                  dalla dashboard, il capitale resta sempre nel tuo portafoglio
                  sotto il tuo controllo.
                </p>

                {/* Tre punti chiave */}
                <ul className="space-y-2 text-sm text-white/90">
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-amber-300" />
                    <span>
                      <span className="font-semibold">
                        Zero operatività manuale.
                      </span>{" "}
                      Niente grafici da seguire o ordini da inserire: la
                      Coscienza AI gestisce tutta l’operatività.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-amber-300" />
                    <span>
                      <span className="font-semibold">
                        Portafoglio personale, non conto comune.
                      </span>{" "}
                      I fondi sono separati e intestati solo a te nel tuo smart
                      contract dedicato.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-amber-300" />
                    <span>
                      <span className="font-semibold">
                        Controllo totale dalla dashboard.
                      </span>{" "}
                      Accedi, controlli saldo e risultati, metti in pausa
                      l’Autopilot, carichi o prelevi in pochi click.
                    </span>
                  </li>
                </ul>

                {/* CTA → SIGNUP */}
                <a
                  href="/signup"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold shadow-[0_22px_60px_rgba(15,23,42,0.9)] hover:bg-slate-100 transition"
                >
                  Attiva Autopilot 99€/mese
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
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
