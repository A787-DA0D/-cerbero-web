"use client";

import Image from "next/image";

export default function DashboardPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#050816] via-[#020617] to-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-white/10 bg-black/20 backdrop-blur-2xl">
        <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10">
          <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center">
            <Image
              src="/cerbero-logo.png"
              alt="Cerbero logo"
              width={28}
              height={28}
              className="object-contain invert brightness-0"
            />
          </div>
          <div className="text-sm font-semibold tracking-tight">
            Cerbero <span className="text-white/50">App</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 text-sm text-white/70">
          <button className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/10 text-white font-medium">
            <span>🏠</span>
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-white/5">
            <span>📊</span>
            <span>Workstation</span>
          </button>
          <button className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-white/5">
            <span>💳</span>
            <span>Wallet</span>
          </button>
          <button className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-white/5">
            <span>⚙️</span>
            <span>Account</span>
          </button>
        </nav>

        <div className="px-4 pb-6 text-[11px] text-white/40">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <div className="font-semibold text-xs mb-1">Piano attivo</div>
            <div className="text-xs">Autopilot • 80€/mese</div>
          </div>
        </div>
      </aside>

      {/* Contenuto principale */}
      <section className="flex-1 px-4 md:px-8 py-6 md:py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Benvenuto in Cerbero
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Controlla saldo, andamento e stato del tuo pilota in un unico
              pannello.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-2xl bg-emerald-500/10 text-emerald-300 px-3 py-1 border border-emerald-500/40">
              🟢 Coscienza AI attiva
            </div>
            <div className="rounded-2xl bg-white/5 px-3 py-1 border border-white/10 text-white/70">
              Piano: <span className="font-semibold text-white">Autopilot</span>
            </div>
          </div>
        </header>

        {/* Metriche principali */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Saldo totale */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
            <div className="text-xs text-white/60 mb-1">Saldo totale</div>
            <div className="text-2xl font-semibold mb-1">€ 12.480</div>
            <div className="text-xs text-emerald-400">+€ 540 questo mese</div>
          </div>

          {/* P&L mese */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
            <div className="text-xs text-white/60 mb-1">P&amp;L mese</div>
            <div className="text-2xl font-semibold mb-1 text-emerald-400">
              +4,5%
            </div>
            <div className="text-xs text-white/60">
              Equity in crescita rispetto al mese scorso.
            </div>
          </div>

          {/* Stato pilota */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs text-white/60 mb-1">Stato pilota</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Autotrading</div>
                  <div className="text-xs text-white/60">
                    La Coscienza gestisce le operazioni.
                  </div>
                </div>
                {/* interruttore finto */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">OFF</span>
                  <div className="w-11 h-6 rounded-full bg-emerald-500/30 border border-emerald-400/60 flex items-center justify-end px-1">
                    <div className="h-4 w-4 rounded-full bg-white" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">
                    ON
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Azioni principali */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button className="rounded-2xl bg-white text-[#020617] text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition">
            Carica fondi
          </button>
          <button className="rounded-2xl border border-white/40 text-sm font-semibold px-5 py-2.5 hover:bg-white/5 transition">
            Preleva
          </button>
          <span className="text-xs text-white/50">
            Il tuo capitale resta sempre nel tuo smart contract 1-a-1.
          </span>
        </div>

        {/* Operazioni recenti (mock) */}
        <section className="rounded-3xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Operazioni recenti</h2>
            <span className="text-[11px] text-white/50">
              Dati dimostrativi • v1 preview
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead className="text-white/50 text-[11px]">
                <tr>
                  <th className="text-left pr-4">Data</th>
                  <th className="text-left pr-4">Mercato</th>
                  <th className="text-left pr-4">Tipo</th>
                  <th className="text-left pr-4">Esito</th>
                  <th className="text-right">P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: "17 Nov, 09:32",
                    market: "EURUSD",
                    type: "Autotrade",
                    outcome: "Take Profit",
                    pnl: "+€120",
                  },
                  {
                    date: "16 Nov, 15:11",
                    market: "NAS100",
                    type: "Manuale + AI",
                    outcome: "Parziale chiusura",
                    pnl: "+€65",
                  },
                  {
                    date: "16 Nov, 10:05",
                    market: "XAUUSD",
                    type: "Autotrade",
                    outcome: "Stop protetto",
                    pnl: "-€40",
                  },
                ].map((row, i) => (
                  <tr key={i} className="bg-black/20">
                    <td className="rounded-l-2xl px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">{row.market}</td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.outcome}</td>
                    <td className="rounded-r-2xl px-3 py-2 text-right">
                      <span
                        className={
                          row.pnl.startsWith("+")
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {row.pnl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
