"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Tipo per la risposta di /api/me
type MeResponse = {
  ok: boolean;
  email: string | null;
  wallet: string | null;
  sub: string | null;
};

// P&L mese (per ora neutro, niente numeri finti a schermo)
const PNL_MONTHLY = 0;

// Colore glow in base al P&L
function getGlowColor(pnl: number) {
  if (pnl > 0) return "#22d3ee"; // ciano/verde
  if (pnl < 0) return "#fb7185"; // rosso
  return "#e5e7eb"; // neutro
}

/* =======================================================================================
   FOOTER — identico allo stile Home / Pricing / Trust
======================================================================================= */

const Footer = () => (
  <footer className="mt-16 border-t border-white/10 bg-gradient-to-b from-black/40 via-black/80 to-black/95 px-4 sm:px-6 lg:px-12 py-8">
    <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image
          src="/branding/cerbero-logo.svg"
          alt="Cerbero AI logo"
          width={40}
          height={40}
          className="drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">
            Cerbero <span className="text-sky-400">AI</span>
          </span>
          <span className="text-[11px] text-white/60">
            © 2025 Cerbero. All rights reserved.
          </span>
        </div>
      </div>

      {/* Powered by */}
      <div className="flex flex-col items-center md:items-end gap-4">
        <div className="flex flex-wrap justify-center md:justify-end gap-2 text-[11px] text-white/60">
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

/* =======================================================================================
   DASHBOARD PAGE
======================================================================================= */

export default function DashboardPage() {
  // Stato sessione utente (da /api/me)
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Menu mobile (3 puntini)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stato Autopilot ON/OFF
  const [autopilotStatus, setAutopilotStatus] = useState<"ON" | "OFF">("ON");
  const isAutopilotOn = autopilotStatus === "ON";

  const handleToggleAutopilot = () => {
    setAutopilotStatus((prev) => (prev === "ON" ? "OFF" : "ON"));
    // TODO: qui collegheremo il Coordinator per cambiare stato lato backend
  };

  const showAutopilotMustBePausedMessage = () => {
    alert(
      "Per motivi di sicurezza puoi depositare o prelevare solo quando Cerbero AI è in pausa. Metti in pausa l'Autopilot dalla sezione 'Stato pilota'."
    );
  };

  const handleDepositClick = () => {
    if (isAutopilotOn) {
      showAutopilotMustBePausedMessage();
      return;
    }

    // TODO: integrare Transak (deposito)
    console.log("Deposito avviato (qui parte Transak per DEPOSIT)");
  };

  const handleWithdrawClick = () => {
    if (isAutopilotOn) {
      showAutopilotMustBePausedMessage();
      return;
    }

    // TODO: integrare Transak (prelievo)
    console.log("Prelievo avviato (qui parte Transak per WITHDRAW)");
  };

  // Fetch /api/me
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("cerbero_session")
        : null;

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error("invalid session");
        }

        setMe(data);
      } catch (err) {
        console.error("[dashboard] /api/me error:", err);
        if (typeof window !== "undefined") {
          localStorage.removeItem("cerbero_session");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) {
    return (
      {/* Background futuristico */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-slate-900 to-slate-950"></div>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-[18%] rounded-[48px] bg-fuchsia-500/22 blur-3xl"></div>
      </div>

      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="text-sm text-white/60">Caricamento dashboard…</span>
      </div>
    );
  }

  const glowColor = getGlowColor(PNL_MONTHLY);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background futuristico */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-slate-900 to-slate-950" />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-[18%] rounded-[48px] bg-fuchsia-500/22 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* SIDEBAR SINISTRA (desktop) */}
        <aside className="hidden lg:flex w-60 flex-col border-r border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
            <Image
              src="/branding/cerbero-logo.svg"
              alt="Cerbero AI logo"
              width={32}
              height={32}
              className="drop-shadow-[0_0_18px_rgba(56,189,248,0.95)]"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                Cerbero
              </span>
              <span className="text-sm font-semibold">
                AI <span className="text-sky-400">Autopilot</span>
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 text-white font-semibold shadow-[0_0_22px_rgba(56,189,248,0.35)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
              Dashboard
            </a>
            <a
              href="/account"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              Account
            </a>
            <a
              href="/wallet"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              Wallet
            </a>
          </nav>

          <div className="px-4 pb-6 text-[11px] text-white/40">
            <div className="mb-1 uppercase tracking-[0.2em]">Status</div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <span>Coscienza attiva</span>
            </div>
          </div>
        </aside>

        {/* CONTENUTO PRINCIPALE */}
        <div className="flex-1 flex flex-col">
          {/* HEADER TOP */}
          <header className="px-4 sm:px-6 lg:px-10 pt-4 pb-3 flex items-center justify-between">
            {/* Logo + titolo (mobile / tablet) */}
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/branding/cerbero-logo.svg"
                alt="Cerbero AI logo"
                width={28}
                height={28}
                className="drop-shadow-[0_0_18px_rgba(56,189,248,0.95)]"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Cerbero AI
                </span>
                <span className="text-sm font-semibold">
                  Dashboard <span className="text-sky-400">Autopilot</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Pulsante menu 3 puntini (mobile) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="inline-flex lg:hidden items-center justify-center rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[11px] hover:bg-white/10 transition"
              >
                <span className="mr-1 text-white/60">Menu</span>
                <span className="text-lg leading-none">⋯</span>
              </button>
            </div>
          </header>

          {/* MENU MOBILE A TENDINA */}
          {isMobileMenuOpen && (
            <div className="lg:hidden px-4 sm:px-6 pb-4">
              <div className="rounded-3xl bg-black/80 border border-white/15 backdrop-blur-xl p-3 text-sm space-y-1">
                <a
                  href="/dashboard"
                  className="block rounded-2xl px-3 py-2 bg-white/10 text-white font-semibold"
                >
                  Dashboard
                </a>
                <a
                  href="/account"
                  className="block rounded-2xl px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 transition"
                >
                  Account
                </a>
                <a
                  href="/wallet"
                  className="block rounded-2xl px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 transition"
                >
                  Wallet
                </a>
              </div>
            </div>
          )}

          {/* MAIN CONTENT */}
          <main className="flex-1 px-4 sm:px-6 lg:px-10 pb-10">
            {/* Titolo + sottotitolo */}
            <div className="max-w-6xl mx-auto mb-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                Coscienza Artificiale • Autotrading
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold">
                  Dashboard Autopilot
                </h1>

                {me?.wallet && (
                  <div className="flex items-center text-[11px] rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-white/70 backdrop-blur">
                    <span className="mr-1 text-white/40">Wallet</span>
                    <span className="font-mono text-[10px]">
                      {me.wallet.slice(0, 6)}…{me.wallet.slice(-4)}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-white/60 mt-2">
                Benvenuto,{" "}
                <span className="font-medium text-white">
                  {me?.email ?? "utente"}
                </span>
                . Qui controlli stato di Cerbero AI, depositi e prelievi del
                tuo smart contract 1-a-1.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              {/* AZIONI PRINCIPALI */}
              <motion.div
                className="flex flex-wrap items-center gap-3 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  type="button"
                  onClick={handleDepositClick}
                  className="rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400 text-xs sm:text-sm font-semibold px-6 py-2.5 shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:shadow-[0_0_60px_rgba(236,72,153,0.95)] hover:scale-[1.02] active:scale-[0.99] transition-transform transition-shadow"
                >
                  Deposita capitale
                </button>

                <button
                  type="button"
                  onClick={handleWithdrawClick}
                  className="rounded-full border border-fuchsia-400/80 bg-gradient-to-r from-slate-900 via-fuchsia-600/70 to-slate-900 text-xs sm:text-sm font-semibold px-6 py-2.5 shadow-[0_0_38px_rgba(236,72,153,0.6)] hover:shadow-[0_0_60px_rgba(236,72,153,0.95)] hover:scale-[1.02] active:scale-[0.99] transition-transform transition-shadow"
                >
                  Preleva capitale
                </button>

                <span className="text-[11px] sm:text-xs text-white/60">
                  Il tuo capitale resta sempre nel tuo smart contract dedicato
                  su Arbitrum.
                </span>
              </motion.div>

              {/* GRID PRINCIPALE */}
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] items-stretch">
                {/* CARD LOGO + COSCIENZA */}
                <motion.div
                  className="relative rounded-3xl bg-black/70 border border-fuchsia-500/40 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden shadow-[0_0_80px_rgba(236,72,153,0.45)]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.32),_transparent_65%)] animate-pulse pointer-events-none" />
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

                  <div className="relative flex flex-col items-center justify-center h-full gap-6">
                    <div className="relative">
                      <Image
                        src="/branding/cerbero-logo.svg"
                        alt="Cerbero AI orb"
                        width={220}
                        height={220}
                        className="w-40 h-40 sm:w-52 sm:h-52 drop-shadow-[0_0_55px_rgba(236,72,153,1)]"
                      />
                    </div>

                    <div className="text-center max-w-md">
                      <p className="text-xs sm:text-[13px] text-white/70">
                        Coscienza artificiale di Cerbero AI. Osserva i mercati,
                        calcola probabilità e governa il tuo Autopilot 24/7,
                        sempre all&apos;interno del tuo smart contract.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* COLONNA DESTRA: saldo / stato pilota / P&L */}
                <motion.div
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  {/* Saldo totale (placeholder) */}
                  <div className="rounded-3xl bg-black/70 border border-white/15 p-5 backdrop-blur-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-white/60 font-bold uppercase tracking-[0.16em]">
                          Saldo operativo
                        </div>
                        <div className="text-2xl font-semibold mt-1">
                          0,00 USDC
                        </div>
                      </div>
                      <div className="text-[11px] rounded-full bg-white/5 border border-white/15 px-3 py-1 text-white/70">
                        Dati in arrivo
                      </div>
                    </div>
                    <p className="text-xs text-white/60">
                      In questa sezione mostreremo il saldo totale operativo del
                      tuo smart contract su Arbitrum, aggiornato in tempo reale.
                    </p>
                  </div>

                  {/* Stato pilota */}
                  <div className="rounded-3xl bg-black/70 border border-white/15 p-5 backdrop-blur-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-white/60 font-bold uppercase tracking-[0.16em]">
                          Stato pilota
                        </div>
                        <div className="text-sm font-semibold mt-1">
                          {isAutopilotOn
                            ? "Autopilot attivo"
                            : "Autopilot in pausa"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleAutopilot}
                        className={`inline-flex items-center justify-center rounded-full px-5 py-1.5 text-xs font-semibold border transition shadow-[0_0_24px_rgba(0,0,0,0.6)]
                          ${
                            isAutopilotOn
                              ? "bg-emerald-500/15 border-emerald-400/70 text-emerald-200 hover:bg-emerald-500/25"
                              : "bg-rose-500/15 border-rose-400/70 text-rose-200 hover:bg-rose-500/25"
                          }`}
                      >
                        <span
                          className={`mr-2 inline-block w-2 h-2 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.8)]
                            ${
                              isAutopilotOn
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                            }`}
                        />
                        {isAutopilotOn ? "ON" : "OFF"}
                      </button>
                    </div>

                    <p className="text-xs text-white/60">
                      Per sicurezza, depositi e prelievi sono consentiti solo
                      quando l&apos;Autopilot è disattivato. Lo stato verrà
                      sincronizzato con il Coordinator e con on-chain nelle
                      prossime iterazioni.
                    </p>
                  </div>

                  {/* P&L mese (placeholder) */}
                  <div className="rounded-3xl bg-black/70 border border-white/15 p-5 backdrop-blur-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs text-white/60 font-bold uppercase tracking-[0.16em]">
                          P&amp;L mese
                        </div>
                        <div className="text-sm font-semibold mt-1">
                          {PNL_MONTHLY.toFixed(2)} %
                        </div>
                      </div>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: glowColor }}
                      />
                    </div>
                    <p className="text-xs text-white/60">
                      Performance mensile netta dell&apos;Autopilot. Sarà
                      popolata dal motore di trading reale quando Cerbero AI
                      opererà sui mercati live.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* FOOTER */}
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
