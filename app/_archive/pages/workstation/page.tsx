"use client";

import Image from "next/image";

export default function WorkstationPage() {
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
          <a
            href="/dashboard"
            className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-white/5"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </a>
          <a
            href="/workstation"
            className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/10 text-white font-medium"
          >
            <span>📊</span>
            <span>Workstation</span>
          </a>
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
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Workstation 3.0
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Grafico pulito, bottoni chiari. Tu decidi il click, la Coscienza
              ti aiuta con probabilità e contesto.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="rounded-2xl bg-emerald-500/10 text-emerald-300 px-3 py-1 border border-emerald-500/40">
              🧠 Analisi Coscienza live
            </div>
            <div className="rounded-2xl bg-white/5 px-3 py-1 border border-white/10 text-white/70">
              Modalità: <span className="font-semibold text-white">Pilot</span>
            </div>
          </div>
        </header>

        {/* Layout 2 colonne */}
        <div className="grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-6 mb-8">
          {/* Colonna sinistra: grafico */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-4 md:p-5 flex flex-col">
            {/* Toolbar grafico */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-black/40 border border-white/15 px-3 py-1.5 text-sm">
                  EURUSD
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/60">
                  <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-2 py-0.5 border border-emerald-500/40">
                    Trend: rialzista
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 border border-white/10">
                    Volatilità: media
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="rounded-2xl bg-black/40 border border-white/15 px-2 py-0.5 flex items-center gap-1">
                  {["M5", "M15", "H1", "H4", "D1"].map((tf) => (
                    <button
                      key={tf}
                      className={`px-2 py-0.5 rounded-xl ${
                        tf === "M15" ? "bg-white text-[#020617]" : "text-white/70"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Area grafico mock */}
            <div className="relative flex-1 min-h-[260px] md:min-h-[320px] rounded-2xl bg-gradient-to-b from-white/10 via-black/40 to-black/80 overflow-hidden border border-white/5 mb-4">
              {/* Grid */}
              <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,#ffffff33_1px,transparent_0)] [background-size:24px_24px]" />
              {/* Finto tracciato / candele */}
              <div className="relative z-10 h-full flex items-end px-4 gap-1 md:gap-1.5">
                {[40, 55, 38, 62, 70, 65, 78, 60, 72, 68, 80, 76, 90].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 flex items-end justify-center"
                    >
                      <div
                        className="w-full max-w-[10px] md:max-w-[14px] rounded-full bg-emerald-400/80"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  )
                )}
              </div>
              {/* Ultimo prezzo */}
              <div className="absolute top-3 right-3 rounded-2xl bg-black/70 px-3 py-1.5 text-xs border border-white/15">
                <div className="text-[11px] text-white/60">Ultimo prezzo</div>
                <div className="font-semibold">1.08642</div>
              </div>
            </div>

            {/* Info posizione corrente */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
              <div className="rounded-2xl bg-black/40 border border-white/15 px-3 py-1.5">
                Posizione corrente: <span className="text-emerald-300">LONG</span>
              </div>
              <div className="rounded-2xl bg-black/40 border border-white/15 px-3 py-1.5">
                Size: 0.50 lotti • Rischio: 1%
              </div>
              <div className="rounded-2xl bg-black/40 border border-white/15 px-3 py-1.5">
                P&amp;L live: <span className="text-emerald-300">+€ 85</span>
              </div>
            </div>
          </div>

          {/* Colonna destra: Analisi Coscienza */}
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white/5 border border-white/10 p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">Coscienza – Copilota</h2>
                  <p className="text-xs text-white/60">
                    Analisi in tempo reale sul mercato selezionato.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 text-emerald-300 text-[11px] px-2 py-1 border border-emerald-500/40">
                  Probabilità 78%
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-white/60">Bias di mercato</div>
                  <div className="font-semibold text-emerald-300">
                    Rialzista moderato
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">
                    Trend H1 e H4 allineati, momentum in raffreddamento su M5.
                  </div>
                </div>

                <div>
                  <div className="text-white/60">Azione suggerita</div>
                  <div className="font-semibold">
                    Mantieni la posizione, prendi profitto parziale a +1.2R
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">
                    Evita nuovi ingressi in questa zona, attendi nuovo impulso o
                    ritracciamento.
                  </div>
                </div>

                <div>
                  <div className="text-white/60">Scudi di protezione</div>
                  <ul className="mt-1 space-y-1 text-[11px]">
                    <li>• Stop protetto già spostato in area di pareggio.</li>
                    <li>
                      • Rischio giornaliero sotto il limite, nessun blocco attivo.
                    </li>
                    <li>• Nessuna correlazione eccessiva con altre posizioni.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-white/50">
                <span>Ultimo aggiornamento: 12s fa</span>
                <button className="rounded-xl border border-white/20 px-2 py-1 hover:bg-white/5">
                  Aggiorna analisi
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 p-4 md:p-5 text-xs text-white/60">
              <div className="font-semibold text-white mb-1">
                Nota importante (v1)
              </div>
              In questa versione la Workstation è solo dimostrativa. I dati e le
              probabilità che vedi sono mock, ma il layout è già pronto per
              collegare la vera Coscienza AI e il motore di esecuzione.
            </div>
          </aside>
        </div>

        {/* Bottoni operativi */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button className="rounded-2xl bg-emerald-400 text-[#020617] text-sm font-semibold px-6 py-3 shadow-lg shadow-emerald-500/30 hover:brightness-110 transition">
            BUY • Apri LONG
          </button>
          <button className="rounded-2xl bg-red-500 text-white text-sm font-semibold px-6 py-3 shadow-lg shadow-red-500/30 hover:brightness-110 transition">
            SELL • Apri SHORT
          </button>
          <button className="rounded-2xl border border-white/40 text-sm font-semibold px-5 py-3 hover:bg-white/5 transition">
            Chiudi tutte le posizioni
          </button>
        </div>

        {/* Ordini aperti (mock) */}
        <section className="rounded-3xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Ordini aperti</h2>
            <span className="text-[11px] text-white/50">
              Solo lettura • dati fittizi
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead className="text-white/50 text-[11px]">
                <tr>
                  <th className="text-left pr-4">Mercato</th>
                  <th className="text-left pr-4">Direzione</th>
                  <th className="text-left pr-4">Size</th>
                  <th className="text-left pr-4">Entry</th>
                  <th className="text-left pr-4">SL</th>
                  <th className="text-left pr-4">TP</th>
                  <th className="text-right">P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    market: "EURUSD",
                    dir: "LONG",
                    size: "0.50",
                    entry: "1.08210",
                    sl: "1.07650",
                    tp: "1.09500",
                    pnl: "+€85",
                  },
                  {
                    market: "NAS100",
                    dir: "SHORT",
                    size: "0.20",
                    entry: "17890",
                    sl: "17980",
                    tp: "17620",
                    pnl: "+€32",
                  },
                  {
                    market: "XAUUSD",
                    dir: "LONG",
                    size: "0.10",
                    entry: "2375.0",
                    sl: "2358.0",
                    tp: "2408.0",
                    pnl: "-€12",
                  },
                ].map((row, i) => (
                  <tr key={i} className="bg-black/20">
                    <td className="rounded-l-2xl px-3 py-2">{row.market}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          row.dir === "LONG"
                            ? "text-emerald-300 font-semibold"
                            : "text-red-400 font-semibold"
                        }
                      >
                        {row.dir}
                      </span>
                    </td>
                    <td className="px-3 py-2">{row.size}</td>
                    <td className="px-3 py-2">{row.entry}</td>
                    <td className="px-3 py-2">{row.sl}</td>
                    <td className="px-3 py-2">{row.tp}</td>
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
