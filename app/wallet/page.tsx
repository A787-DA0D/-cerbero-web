"use client";

import React from "react";
import { motion } from "framer-motion";

const movements = [
  {
    date: "18 Nov, 10:12",
    type: "Deposito",
    detail: "On-ramp banca → USDC",
    chain: "Arbitrum",
    amount: "+3,000 USDC",
  },
  {
    date: "17 Nov, 16:40",
    type: "Profitto",
    detail: "Cerbero Trade · settimana",
    chain: "Arbitrum",
    amount: "+540 USDC",
  },
  {
    date: "16 Nov, 09:05",
    type: "Prelievo",
    detail: "USDC → conto bancario",
    chain: "Arbitrum",
    amount: "-1,000 USDC",
  },
];

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#071329] to-[#020617] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* HEADER */}
        <header className="mb-8 space-y-2">
          <p className="text-xs tracking-[0.25em] text-emerald-300/70 uppercase">
            CAPITAL ENGINE
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Wallet Cerbero
          </h1>
          <p className="mt-1 text-sm text-white/65 max-w-2xl">
            Il tuo capitale operativo in USDC, custodito nel tuo smart contract
            1-a-1 su Arbitrum. Sempre visibile, sempre sotto il tuo controllo.
          </p>
        </header>

        {/* GRID PRINCIPALE */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)] mb-6">
          {/* CARD SALDO / EQUITY */}
          <motion.section
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/70 via-[#020617] to-slate-950/70 px-6 py-5 shadow-[0_26px_80px_rgba(0,0,0,0.9)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -top-20 -left-10 h-56 w-56 rounded-full blur-3xl"
                style={{ backgroundColor: "#22d3ee" }}
                animate={{ opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-24 right-0 h-60 w-60 rounded-full blur-3xl"
                style={{ backgroundColor: "#22c55e" }}
                animate={{ opacity: [0.15, 0.5, 0.15] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </div>

            <div className="relative space-y-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
                <span>Saldo operativo</span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-400/40">
                  Dati demo · v1
                </span>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-white/50 mb-1">
                    Capitale su smart contract 1-a-1
                  </div>
                  <div className="text-4xl font-semibold tracking-tight">
                    12,480{" "}
                    <span className="text-base font-normal text-white/60">
                      USDC
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-emerald-300/90">
                    +540 USDC questo mese
                  </div>
                </div>

                <div className="text-right text-xs text-white/60 space-y-0.5">
                  <div>
                    Equivalente stimato:{" "}
                    <span className="text-white">≈ € 11.480</span>
                  </div>
                  <div>
                    Indirizzo wallet:{" "}
                    <span className="font-mono text-[11px] text-white/80">
                      0x1a2e…97Fc
                    </span>
                  </div>
                  <div>
                    Rete: <span className="text-emerald-300">Arbitrum One</span>
                  </div>
                </div>
              </div>

              {/* Mini-grafico animato */}
              <div className="mt-3 rounded-2xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/10 px-4 py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-white/60">Equity 30 gg · mock</p>
                  <p className="text-sm text-emerald-300">
                    Trend positivo controllato
                  </p>
                  <p className="text-[11px] text-white/50">
                    La Coscienza regola l&apos;esposizione in base al rischio
                    definito.
                  </p>
                </div>

                <div className="flex gap-1.5 items-end h-16">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 rounded-full bg-emerald-400"
                      initial={{ height: 10 + (i % 6) * 4 }}
                      animate={{ height: 12 + ((i * 7) % 24) }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        delay: i * 0.04,
                        repeatType: "reverse",
                      }}
                      style={{ opacity: 0.35 + (i % 4) * 0.12 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* CARD CASSAFORTE / PARAMETRI */}
          <motion.section
            className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.75)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <header className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
              <span>Cassaforte personale</span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-400/40">
                Smart contract 1-a-1 • OK
              </span>
            </header>

            <div className="mt-3">
              <h3 className="text-sm font-semibold">
                Smart Contract dedicato · Cerbero Ponte
              </h3>
              <p className="mt-1 text-xs text-white/60 leading-relaxed">
                Il capitale vive nel tuo smart contract intestato a te. Cerbero
                ha solo il telecomando operativo, non le chiavi della
                cassaforte.
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-y-3 text-xs text-white/70">
              <div className="space-y-0.5">
                <dt className="text-white/40">Prelievo disponibile</dt>
                <dd className="text-emerald-300">Sì</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-white/40">Autotrading</dt>
                <dd className="text-emerald-300">Attivo</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-white/40">Limite rischio giornaliero</dt>
                <dd className="text-white">3% equity</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-white/40">Custodia terze parti</dt>
                <dd className="text-rose-300">Nessuna</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">
                Audit interno continuo
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">
                Storico on-chain verificabile
              </span>
            </div>
          </motion.section>
        </div>

        {/* BOTTONI AZIONE */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button className="rounded-2xl bg-white text-slate-950 px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition">
            Carica fondi
          </button>
          <button className="rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-400/40 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-500/20 transition">
            Preleva
          </button>
          <button className="rounded-2xl bg-white/5 text-white/80 border border-white/10 px-4 py-2.5 text-sm hover:bg-white/10 transition">
            Vedi su explorer
          </button>
        </motion.div>

        {/* STORICO MOVIMENTI */}
        <motion.section
          className="rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/50 to-black/70 px-5 py-5 shadow-[0_22px_70px_rgba(0,0,0,0.9)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Movimenti recenti</h2>
            <span className="text-[11px] text-white/50">
              Dati dimostrativi · v1 preview
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead className="text-white/50 text-[11px]">
                <tr>
                  <th className="text-left pr-4">Data</th>
                  <th className="text-left pr-4">Tipo</th>
                  <th className="text-left pr-4">Dettaglio</th>
                  <th className="text-left pr-4">Rete</th>
                  <th className="text-right pr-4">Importo</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((row, i) => (
                  <motion.tr
                    key={i}
                    className="bg-white/5"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.07 * i }}
                  >
                    <td className="rounded-l-2xl px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.detail}</td>
                    <td className="px-3 py-2">{row.chain}</td>
                    <td className="rounded-r-2xl px-3 py-2 text-right">
                      <span
                        className={
                          row.amount.startsWith("+")
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {row.amount}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
