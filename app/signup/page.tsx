"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

function isValidEmailFormat(email: string) {
  // semplice ma efficace: evita spazi, richiede @ e un punto dopo
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [consent, setConsent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const normalizedEmailConfirm = useMemo(
    () => emailConfirm.trim().toLowerCase(),
    [emailConfirm]
  );

  const canSubmit = useMemo(() => {
    if (!fullName.trim()) return false;
    if (!normalizedEmail) return false;
    if (!normalizedEmailConfirm) return false;
    if (!isValidEmailFormat(normalizedEmail)) return false;
    if (normalizedEmail !== normalizedEmailConfirm) return false;
    if (!consent) return false;
    return true;
  }, [fullName, normalizedEmail, normalizedEmailConfirm, consent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    const name = fullName.trim();
    const e1 = normalizedEmail;
    const e2 = normalizedEmailConfirm;

    if (!name) {
      setError("Inserisci nome e cognome.");
      return;
    }
    if (!e1 || !isValidEmailFormat(e1)) {
      setError("Controlla l’indirizzo email: non sembra valido.");
      return;
    }
    if (e1 !== e2) {
      setError("Le due email non coincidono. Ricontrolla e riprova.");
      return;
    }
    if (!consent) {
      setError("Devi accettare termini, privacy e rischi del servizio.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step successivo: qui chiameremo /api/register (che poi porta a Stripe)
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: e1,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error === "EMAIL_INVALID"
            ? "Controlla l’indirizzo email: non sembra valido."
            : data?.error === "EMAIL_MISMATCH"
            ? "Le due email non coincidono. Ricontrolla e riprova."
            : data?.error === "MISSING_FIELDS"
            ? "Compila tutti i campi richiesti."
            : data?.error || "Errore di registrazione. Riprova tra poco.";
        setError(msg);
        return;
      }

      // Se /api/register ci dà un redirectUrl (Stripe Checkout), andiamo lì
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // fallback (non dovrebbe mai succedere)
      setError("Errore: URL pagamento mancante. Riprova.");
    } catch (err) {
      console.error("[signup] submit error:", err);
      setError("Errore di connessione. Controlla la rete e riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-none text-white">
      {/* VIDEO DI SFONDO */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/signup-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* CONTENUTO */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-5xl mx-auto rounded-[32px] bg-black/30 border border-white/15 px-6 py-8 md:px-10 md:py-10 shadow-[0_40px_160px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          {/* HEADER: logo + step */}
          <div className="mb-8 flex items-start justify-between gap-4">
            {/* Logo + naming */}
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 flex items-center justify-center">
                {/* glow circolare */}
                <div
                  className="absolute inset-0 rounded-full bg-emerald-400/35 blur-xl opacity-80 animate-pulse"
                  aria-hidden
                />
                <Image
                  src="/branding/cerbero-logo.svg"
                  alt="Cerbero AI logo"
                  width={44}
                  height={44}
                  className="relative z-10 select-none pointer-events-none drop-shadow-[0_0_16px_rgba(16,185,129,0.9)]"
                />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold">
                  Cerbero <span className="text-emerald-300">AI</span>
                </div>
                <div className="text-[11px] text-white/60">
                  Switch On. Sit back. Relax.
                </div>
              </div>
            </div>

            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              Step 1 / 2 · Crea account
            </div>
          </div>

          {/* GRID: form + card info */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            {/* COLONNA SINISTRA – FORM */}
            <div>
              <div className="mb-5">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Crea il tuo account{" "}
                  <span className="text-emerald-300">Cerbero AI</span>
                </h1>

                <p className="mt-3 text-sm md:text-[15px] text-white/80 leading-relaxed max-w-xl">
                  In questa fase attivi direttamente{" "}
                  <span className="font-semibold text-emerald-300">
                    Autopilot 99€/mese
                  </span>
                  .
                  <br />
                  La Coscienza AI opera sul tuo{" "}
                  <span className="font-semibold">portafoglio digitale</span>{" "}
                  secondo i parametri che imposti.
                  <br />
                  Il capitale resta sempre{" "}
                  <span className="font-semibold">sotto il tuo controllo</span>.
                </p>

                <p className="mt-3 text-[11px] text-white/60">
                  Consiglio: controlla bene l’email — è dove riceverai il link di
                  accesso (Magic Link).
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Nome e cognome */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/75">
                    Nome e cognome
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="w-full rounded-2xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/70"
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/75">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@esempio.com"
                    className="w-full rounded-2xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/70"
                    autoComplete="email"
                  />
                </div>

                {/* Conferma Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/75">
                    Conferma email
                  </label>
                  <input
                    type="email"
                    value={emailConfirm}
                    onChange={(e) => setEmailConfirm(e.target.value)}
                    placeholder="ripeti l’email"
                    className="w-full rounded-2xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/70"
                    autoComplete="email"
                  />
                </div>

                {/* Consenso legale */}
                <div className="space-y-2 pt-1 text-[11px] text-white/60">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-3 w-3 rounded border-white/40 bg-black/60"
                    />
                    <span>
                      Confermo di aver letto e accettato termini, privacy e rischi
                      del servizio. Capisco che il trading comporta possibilità
                      di perdita del capitale.
                    </span>
                  </label>
                </div>

                {/* Error box */}
                {error && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">
                    {error}
                  </div>
                )}

                {/* CTA */}
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="mt-2 w-full rounded-2xl bg-white text-slate-950 text-sm font-semibold py-3 shadow-[0_18px_60px_rgba(15,23,42,0.95)] hover:bg-slate-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Reindirizzamento al pagamento..." : "Crea account e continua"}
                </button>

                <div className="text-[11px] text-white/60 text-center pt-2">
                  Hai già un account?{" "}
                  <a
                    href="/login"
                    className="text-white hover:text-emerald-300 transition"
                  >
                    Accedi
                  </a>
                </div>
              </form>
            </div>

            {/* COLONNA DESTRA – CARD AUTOPILOT */}
            <div className="rounded-[28px] bg-emerald-900/25 border border-emerald-400/60 px-5 py-5 md:px-6 md:py-6 shadow-[0_30px_80px_rgba(16,185,129,0.55)] backdrop-blur-2xl">
              {/* Header pannello */}
              <div className="flex items-center justify-between text-[11px] font-medium text-emerald-200/90 mb-4">
                <span className="tracking-[0.18em] uppercase">
                  Autopilot · Cosa è incluso
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-400/60 px-2 py-0.5 text-[10px]">
                  Autopilot ON
                </span>
              </div>

              {/* Contenuto pannello */}
              <div className="space-y-4 text-sm text-emerald-50">
                <div>
                  <p className="font-semibold text-[13px] text-white/90">
                    Autopilot — 99€/mese
                  </p>
                  <p className="mt-1 text-[12px] text-emerald-100/85">
                    Autotrading AI sul tuo portafoglio digitale dedicato.
                  </p>
                </div>

                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="font-medium text-[13px] text-emerald-50">
                      Portafoglio digitale intestato a te. Cerbero ha solo il
                      telecomando operativo, non le chiavi per spostare i fondi.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="font-medium text-[13px] text-emerald-50">
                      Limiti di rischio e stop dinamici sempre attivi. Puoi
                      mettere in pausa l’Autopilot in qualsiasi momento dal
                      Wallet.
                    </span>
                  </li>
                </ul>

                <p className="mt-4 text-[11px] text-emerald-100/80">
                  Nessun vincolo annuale, puoi disattivare con un click quando
                  vuoi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
