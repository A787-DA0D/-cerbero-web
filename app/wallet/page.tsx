"use client";

import React from "react";

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] mb-6">
          {/* CARD SALDO */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-[0_22px_70px_rgba(0,0,0,0.75)]">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute -top-16 -left-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
                <span>Saldo operativo</span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
                  Dati demo · v1
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
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

              {/* Mini-grafico */}
              <div className="mt-6 h-24 rounded-2xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/10 flex items-center justify-between px-4">
                <div className="space-y-1">
                  <p className="text-xs text-white/60">Equity 30 gg · mock</p>
                  <p className="text-sm text-emerald-300">
                    Trend positivo controllato
                  </p>
                </div>

                <div className="flex gap-1.5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-full bg-emerald-400/80"
                      style={{
                        height: `${18 + (i % 7) * 5}px`,
                        opacity: 0.4 + (i % 4) * 0.12,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CARD CASSAFORTE */}
          <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-[0_22px_70px_rgba(0,0,0,0.75)]">
            <header className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
              <span>Cassaforte personale</span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
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

            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-white/70">
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
          </section>
        </div>

        {/* BOTTONI AZIONE */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button className="rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition">
            Carica fondi
          </button>
          <button className="rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/40 px-4 py-2 text-sm hover:bg-emerald-500/20 transition">
            Preleva
          </button>
          <button className="rounded-full bg-white/5 text-white/80 border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition">
            Vedi su explorer
          </button>
        </div>

        {/* STORICO MOVIMENTI */}
        <section className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.75)]">
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
                  <th className="text-right">Importo</th>
                </tr>
              </thead>
              <tbody>
                {[
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
                ].map((row, i) => (
                  <tr key={i} className="bg-black/30">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
