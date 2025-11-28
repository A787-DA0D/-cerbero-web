"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleActivateAutopilot = async () => {
    try {
      setErrorMsg(null);
      setLoading(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("cerbero_session")
          : null;

      // Se non sei loggato → vai alla login
      if (!token) {
        if (typeof window !== "undefined") {
          window.location.href = "/login?next=/pricing";
        }
        return;
      }

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // email arriva dal token JWT
      });

      const data = await res.json();

      if (!res.ok || !data.ok || !data.url) {
        console.error("[pricing] stripe error:", data);
        setErrorMsg(
          data.error ||
            "Impossibile avviare il pagamento. Riprova tra qualche minuto."
        );
        return;
      }

      // Redirect a Stripe Checkout
      if (typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("[pricing] unexpected error:", err);
      setErrorMsg(
        "Si è verificato un errore inatteso. Riprova tra qualche minuto."
      );
    } finally {
      setLoading(false);
    }
  };

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

      {/* CONTENUTO */}
      <div className="relative z-10">
        {/* NAVBAR */}
        <header className="px-4 sm:px-6 lg:px-12 pt-5 pb-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            {/* Logo + naming */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center">
                <Image
                  src="/branding/cerbero-logo.svg"
                  alt="Cerbero AI logo"
                  width={40}
                  height={40}
                  className="drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">
                  Cerbero <span className="text-emerald-300">AI</span>
                </span>
                <span className="text-[11px] text-white/60">
                  Switch On. Sit back. Relax.
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm md:text-base font-semibold">
              <a
                href="/"
                className="text-white/80 hover:text-white transition"
              >
                Home
              </a>
              <span className="text-white">Pricing</span>
              <a
                href="/trust"
                className="text-white/80 hover:text-white transition"
              >
                Come funziona
              </a>
              <a
                href="/login"
                className="text-white/80 hover:text-white transition"
              >
                Login
              </a>
            </nav>

            <a
              href="/login"
              className="inline-flex items-center rounded-full bg-white text-slate-900 text-xs md:text-sm font-semibold px-5 py-2.5 shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:shadow-[0_0_32px_rgba(45,212,191,0.9)] transition"
            >
              Accedi
            </a>
          </div>
        </header>

        {/* HERO + TITOLO */}
        <section className="px-4 sm:px-6 lg:px-12 pb-16 pt-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full bg-black/60 border border-white/10 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
              • Un solo pilota. Autopilot.
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Pricing semplice. Solo Autotrading.
            </h1>

            <p className="mt-3 text-sm md:text-base max-w-3xl mx-auto text-white/90 font-semibold">
              Cerbero v1 nasce con un solo pilota dedicato: la Coscienza AI che
              automatizza l’operatività sul tuo portafoglio digitale dedicato,
              con focus su semplicità, controllo del rischio e zero vincoli
              annuali.
            </p>
          </div>

          {/* CARD PRICING CENTRALE */}
          <div className="mt-10 mx-auto max-w-4xl">
            <div className="rounded-[32px] bg-black/70 border border-emerald-500/25 shadow-[0_40px_160px_rgba(0,0,0,0.95)] backdrop-blur-2xl px-6 py-6 sm:px-8 sm:py-8 space-y-6">
              {/* Badge piano */}
              <div className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-400/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-cyan-200">
                Autopilot · Piano unico
              </div>

              <div className="grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)] gap-8 items-start">
                {/* Colonna sinistra: prezzo */}
                <div className="space-y-4">
                  <div>
                    <div className="text-4xl md:text-5xl font-semibold">
                      99€{" "}
                      <span className="text-sm font-normal text-white/70">
                        /mese
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Nessun vincolo annuale. Puoi disattivare con un click
                      quando vuoi.
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm text-white/85">
                    <li className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-amber-300" />
                      <span>
                        Autotrading AI sul tuo portafoglio digitale dedicato.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-amber-300" />
                      <span>
                        Portafoglio digitale intestato a te: Cerbero ha solo il
                        telecomando operativo, non le chiavi per spostare i
                        fondi.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-amber-300" />
                      <span>
                        Limiti di rischio e stop dinamici sempre attivi. Puoi
                        mettere in pausa l’Autopilot in qualsiasi momento dal
                        Wallet.
                      </span>
                    </li>
                  </ul>

                  <button
                    onClick={handleActivateAutopilot}
                    disabled={loading}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold shadow-[0_0_22px_rgba(52,211,153,0.7)] hover:shadow-[0_0_36px_rgba(52,211,153,1)] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Reindirizzamento a Stripe..."
                      : "Attiva Autopilot 99€/mese"}
                  </button>

                  {errorMsg && (
                    <p className="mt-2 text-xs text-red-400 max-w-xs">
                      {errorMsg}
                    </p>
                  )}
                </div>

                {/* Colonna destra: frase chiave spostata dal sottotitolo */}
                <div className="space-y-3 text-sm text-white/85">
                  <p>
                    In questa fase esiste un solo piano:{" "}
                    <span className="text-emerald-300 font-semibold">
                      Autopilot 99€/mese
                    </span>
                    . La Coscienza AI opera sul tuo{" "}
                    <span className="text-emerald-300 font-semibold">
                      portafoglio digitale
                    </span>{" "}
                    secondo i parametri che imposti. Il capitale resta sempre{" "}
                    <span className="text-emerald-300 font-semibold">
                      sotto il tuo controllo
                    </span>
                    .
                  </p>
                  <a
                    href="/trust"
                    className="inline-flex text-emerald-300 text-xs md:text-sm hover:text-emerald-200 underline-offset-4 hover:underline"
                  >
                    Scopri di più su sicurezza &amp; trust →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
