"use client";

import Image from "next/image";

export default function ComeFunziona() {
  return (
    <main className="min-h-screen w-full text-white bg-gradient-to-br from-[#0a0f1c] to-[#0f1b36]">
      
      {/* HERO */}
      <section className="pt-32 pb-20 px-6 mx-auto max-w-5xl text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Come funziona Cerbero
        </h1>
        <p className="text-white/70 mt-4 text-lg">
          Tre step. Tu scegli il pilota, il resto lo fa l’AI.
        </p>
      </section>

      {/* 3 STEPS */}
      <section className="px-6 mx-auto max-w-6xl grid md:grid-cols-3 gap-8 pb-24">

        {/* Step 1 */}
        <div className="rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-xl">
          <div className="text-5xl font-bold text-white/20 mb-4">1</div>
          <h3 className="text-xl font-semibold mb-2">Connect</h3>
          <p className="text-white/70 text-sm">
            Collega wallet, banca o exchange.  
            La connessione è sicura e crittografata.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-xl">
          <div className="text-5xl font-bold text-white/20 mb-4">2</div>
          <h3 className="text-xl font-semibold mb-2">Configura</h3>
          <p className="text-white/70 text-sm">
            Scegli il pilota (manuale o autopilot)  
            e imposta preferenze, rischio e notifiche.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-xl">
          <div className="text-5xl font-bold text-white/20 mb-4">3</div>
          <h3 className="text-xl font-semibold mb-2">Avvia</h3>
          <p className="text-white/70 text-sm">
            L’AI monitora i mercati e gestisce le operazioni  
            mentre tu continui la tua vita.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 mx-auto max-w-4xl pb-24">
        <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">
          Domande frequenti
        </h2>

        <div className="space-y-6">

          <details className="bg-white/5 p-6 rounded-2xl border border-white/10 cursor-pointer">
            <summary className="font-semibold text-lg">Devo essere un trader esperto?</summary>
            <p className="text-white/70 mt-3">
              No. Cerbero è pensato per chi non vuole passare ore sui grafici.  
              Scegli il pilota, il resto lo fa l’AI.
            </p>
          </details>

          <details className="bg-white/5 p-6 rounded-2xl border border-white/10 cursor-pointer">
            <summary className="font-semibold text-lg">Posso cambiare piano quando voglio?</summary>
            <p className="text-white/70 mt-3">
              Sì, puoi passare da Pilot a Autopilot (e viceversa) in qualsiasi momento.
            </p>
          </details>

          <details className="bg-white/5 p-6 rounded-2xl border border-white/10 cursor-pointer">
            <summary className="font-semibold text-lg">Chi controlla i miei fondi?</summary>
            <p className="text-white/70 mt-3">
              Tu. Sempre. Cerbero opera tramite un contratto 1-a-1:  
              noi gestiamo solo il telecomando operativo.
            </p>
          </details>

          <details className="bg-white/5 p-6 rounded-2xl border border-white/10 cursor-pointer">
            <summary className="font-semibold text-lg">Serve esperienza tecnica?</summary>
            <p className="text-white/70 mt-3">
              No. Tutto è pensato per essere semplice da usare, anche su telefono.
            </p>
          </details>

        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-32">
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-medium bg-white text-[#0a1020] hover:opacity-90 transition"
        >
          Attiva Cerbero
        </a>
      </section>
    </main>
  );
}
