"use client";

import Image from "next/image";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-cerbero-trust text-white flex justify-center px-4">
      {/* Glow di sfondo come Login/Signup */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 right-0 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-35"
          style={{
            background: "radial-gradient(circle, #22d3ee 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, #4f7cff 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-5xl py-10 md:py-12">
        {/* HEADER CON LOGO */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center overflow-hidden">
              <Image
                src="/branding/cerbero-logo.svg"
                alt="Cerbero logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                Cerbero <span className="text-white/60">AI</span>
              </span>
              <span className="text-[10px] text-white/55">
                Switch On. Sit back and Relax.
              </span>
            </div>
          </div>

          <span className="text-[11px] text-white/60">
            ID utente demo • #C-0001
          </span>
        </div>

        {/* TITOLO + SOTTOTITOLO */}
        <header className="space-y-2 mb-7">
          <p className="text-xs tracking-[0.25em] text-emerald-300/70 uppercase">
            ACCOUNT CENTER
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Il tuo profilo Cerbero
          </h1>
          <p className="mt-1 text-sm text-white/65 max-w-2xl">
            Gestisci i tuoi dati, il piano Autopilot e le impostazioni di
            sicurezza per l&apos;accesso alla Coscienza AI.
          </p>
        </header>

        {/* GRID PRINCIPALE */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Colonna sinistra: profilo + abbonamento */}
          <div className="space-y-6">
            {/* Profilo */}
            <section className="rounded-3xl border border-white/12 bg-white/8 px-6 py-5 shadow-[0_26px_80px_rgba(0,0,0,0.75)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold">Profilo</h2>
                  <p className="text-xs text-white/60">
                    Informazioni base del tuo account Cerbero.
                  </p>
                </div>
                <span className="text-[11px] rounded-full bg-emerald-500/15 border border-emerald-400/60 px-3 py-1 text-emerald-300">
                  Identità verificata (demo)
                </span>
              </div>

              <div className="grid gap-4 text-sm">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/50 mb-1">
                      Nome e cognome
                    </div>
                    <div className="rounded-2xl bg-black/35 border border-white/10 px-4 py-2.5">
                      Mario Rossi
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-1">Email</div>
                    <div className="rounded-2xl bg-black/35 border border-white/10 px-4 py-2.5">
                      nome@esempio.com
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/50 mb-1">Paese</div>
                    <div className="rounded-2xl bg-black/35 border border-white/10 px-4 py-2.5">
                      Italia (demo)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-1">
                      Data di creazione
                    </div>
                    <div className="rounded-2xl bg-black/35 border border-white/10 px-4 py-2.5">
                      24 Nov 2025
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Abbonamento */}
            <section className="rounded-3xl border border-white/12 bg-gradient-to-br from-black/85 via-black/75 to-slate-950/85 px-6 py-5 shadow-[0_26px_80px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold">Abbonamento</h2>
                  <p className="text-xs text-white/60">
                    Stato del tuo piano Cerbero.
                  </p>
                </div>
                <span className="text-[11px] rounded-full bg-emerald-500/15 border border-emerald-400/60 px-3 py-1 text-emerald-300">
                  Attivo
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-white/50">Piano corrente</div>
                  <div className="mt-1 text-base font-semibold">
                    Autopilot · 80€/mese
                  </div>
                  <p className="mt-1 text-xs text-white/60 max-w-md">
                    Autotrading sempre attivo su smart contract 1-a-1. Puoi
                    mettere in pausa l&apos;operatività dalla Dashboard o dal
                    Wallet.
                  </p>
                </div>

                <div className="flex flex-col items-stretch gap-2 text-xs">
                  <button className="rounded-2xl bg-white text-[#020617] font-semibold px-4 py-2 hover:opacity-90 transition">
                    Gestisci fatturazione (prossimamente)
                  </button>
                  <button className="rounded-2xl border border-white/30 px-4 py-2 text-white/80 hover:bg-white/5 transition">
                    Metti in pausa l&apos;abbonamento
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/60">
                <span className="rounded-full bg-white/5 border border-white/15 px-3 py-1">
                  Rinnovo mensile automatico
                </span>
                <span className="rounded-full bg-white/5 border border-white/15 px-3 py-1">
                  Nessun vincolo annuale
                </span>
              </div>
            </section>
          </div>

          {/* Colonna destra: sicurezza */}
          <section className="rounded-3xl border border-white/12 bg-white/8 px-6 py-5 shadow-[0_26px_80px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Sicurezza accesso</h2>
                <p className="text-xs text-white/60">
                  Login senza password tramite Magic Link.
                </p>
              </div>
              <span className="text-[11px] rounded-full bg-sky-500/15 border border-sky-400/60 px-3 py-1 text-sky-300">
                Magic Link
              </span>
            </div>

            <div className="space-y-4 text-xs text-white/70">
              <div className="rounded-2xl bg-black/35 border border-white/12 px-4 py-3">
                <div className="text-[11px] text-white/50 mb-1">
                  Email principale
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>nome@esempio.com</span>
                  <button className="text-[11px] underline hover:text-white">
                    Modifica (prossimamente)
                  </button>
                </div>
              </div>

              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>
                    Ogni accesso richiede un link univoco inviato alla tua
                    email; nessuna password memorizzata.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>
                    Puoi revocare le sessioni attive eliminando i token dal tuo
                    dispositivo (logout) o contattando il supporto.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>
                    In futuro potrai abilitare ulteriori livelli (es. conferma
                    da app / 2FA) direttamente da questa pagina.
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
