"use client";

import Image from "next/image";
import Link from "next/link";

export default function TrustPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      {/* VIDEO DI SFONDO – NITIDO, SENZA VELO */}
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
        {/* NAVBAR */}
        <header className="px-4 sm:px-6 lg:px-12 pt-5 pb-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            {/* Logo + naming */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center">
                <Image
                  src="/branding/cerbero-logo.svg"
                  alt="Cerbero AI logo"
                  width={40}
                  height={40}
                  className="drop-shadow-[0_0_20px_rgba(56,189,248,0.9)]"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">
                  Cerbero <span className="text-cyan-300">AI</span>
                </span>
                <span className="text-[11px] text-white/60">
                  Switch On. Sit back. Relax.
                </span>
              </div>
            </div>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-8 text-sm md:text-base font-semibold">
              <Link href="/" className="text-white/80 hover:text-white transition">
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-white/80 hover:text-white transition"
              >
                Pricing
              </Link>
              <span className="text-white">Come funziona</span>
              <Link
                href="/login"
                className="text-white/80 hover:text-white transition"
              >
                Login
              </Link>
            </nav>

            {/* CTA login */}
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-white text-slate-900 text-xs md:text-sm font-semibold px-4 py-2 shadow-[0_14px_45px_rgba(15,23,42,0.95)] hover:bg-slate-100 transition"
            >
              Accedi
            </Link>
          </div>
        </header>

        {/* BLOCCO PRINCIPALE */}
        <section className="px-4 sm:px-6 lg:px-12 pb-16 pt-6">
          <div className="mx-auto max-w-4xl text-center mb-10">
            <div className="inline-flex items-center rounded-full bg-black/60 border border-white/15 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl">
              Trust &amp; sicurezza
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Le 3 domande che tutti fanno.
            </h1>

            <p className="mt-4 text-sm md:text-base text-white/90 font-semibold max-w-2xl mx-auto">
              Abbiamo costruito Cerbero per rispondere in modo chiaro a tre dubbi fondamentali:
              <span className="text-white"> dove sono i soldi</span>, 
              <span className="text-white"> cosa può (e non può) fare Cerbero</span> e 
              <span className="text-white"> quali rischi reali esistono sul mercato</span>.
            </p>
          </div>

          {/* 3 CARD GLASS – TRASPARENTI, RESPONSIVE */}
          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
            {/* CARD 1 – Controllo fondi */}
            <article className="rounded-3xl bg-black/55 border border-white/18 px-5 py-6 md:px-6 md:py-7 shadow-[0_30px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/55 mb-2">
                Blocco fondi
              </p>
              <h2 className="text-sm md:text-base font-semibold mb-2">
                I soldi sono bloccati?
              </h2>
              <p className="text-xs md:text-[13px] text-white/80 mb-3">
                No. Il capitale vive nel tuo portafoglio digitale dedicato. Puoi
                richiedere prelievo quando vuoi, seguendo il flusso standard
                banca → USDC → banca.
              </p>
              <ul className="space-y-1.5 text-xs md:text-[13px] text-white/75">
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Portafoglio digitale intestato a te, non conto omnibus di
                    terzi.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Puoi sempre vedere saldo e movimenti dal Wallet e, se vuoi,
                    dal blockchain explorer.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Nessuna custodia non necessaria: Cerbero non tocca mai i
                    fondi direttamente.
                  </span>
                </li>
              </ul>
            </article>

            {/* CARD 2 – Rischio controparte */}
            <article className="rounded-3xl bg-black/55 border border-white/18 px-5 py-6 md:px-6 md:py-7 shadow-[0_30px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/55 mb-2">
                Rischio controparte
              </p>
              <h2 className="text-sm md:text-base font-semibold mb-2">
                Potete scappare con la cassa?
              </h2>
              <p className="text-xs md:text-[13px] text-white/80 mb-3">
                No. Cerbero ha solo il telecomando operativo: può eseguire
                strategie e controlli di rischio, non spostare i fondi verso
                indirizzi arbitrari.
              </p>
              <ul className="space-y-1.5 text-xs md:text-[13px] text-white/75">
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Regole on-chain: il contratto definisce cosa è permesso e
                    cosa è vietato a Cerbero.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Tutto verificabile: indirizzi, transazioni e storico sempre
                    visibili su blockchain explorer.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Contratto di servizio chiaro, senza clausole nascoste in
                    piccolo.
                  </span>
                </li>
              </ul>
            </article>

            {/* CARD 3 – Rischio di mercato */}
            <article className="rounded-3xl bg-black/55 border border-white/18 px-5 py-6 md:px-6 md:py-7 shadow-[0_30px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/55 mb-2">
                Rischio di mercato
              </p>
              <h2 className="text-sm md:text-base font-semibold mb-2">
                Posso perdere tutto?
              </h2>
              <p className="text-xs md:text-[13px] text-white/80 mb-3">
                Il trading ha sempre rischio. La Coscienza AI usa scudi, non
                magie: l&apos;obiettivo è gestire il rischio in modo
                trasparente, non promettere guadagni.
              </p>
              <ul className="space-y-1.5 text-xs md:text-[13px] text-white/75">
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Stop loss, limiti di esposizione e logiche di protezione
                    sempre attive.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Puoi mettere in pausa l&apos;autotrading in qualsiasi
                    momento dal Wallet.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Nessuna promessa di rendimento: solo gestione del rischio e
                    dati osservabili.
                  </span>
                </li>
              </ul>
            </article>
          </div>

          {/* DISCLAIMER FINALE */}
          <div className="mx-auto max-w-4xl mt-10 text-center">
            <p className="text-[11px] md:text-xs text-white/65">
              Nessuna consulenza finanziaria. Il capitale è sempre nel tuo
              portafoglio digitale dedicato; il rischio di mercato resta a tuo
              carico.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
