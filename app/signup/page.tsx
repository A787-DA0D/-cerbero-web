"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:translate-y-[-1px] hover:brightness-110 disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)",
      }}
    >
      {children}
    </button>
  );
}

function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [consent, setConsent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill da /signup?email=...
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const prefill = (url.searchParams.get("email") || "").trim().toLowerCase();
      if (prefill && isValidEmailFormat(prefill)) {
        setEmail(prefill);
        setEmailConfirm(prefill);
      }
    } catch {}
  }, []);

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

    if (!name) return setError("Inserisci nome e cognome.");
    if (!e1 || !isValidEmailFormat(e1))
      return setError("Controlla l’indirizzo email: non sembra valido.");
    if (e1 !== e2)
      return setError("Le due email non coincidono. Ricontrolla e riprova.");
    if (!consent)
      return setError("Devi accettare termini, privacy e rischi del servizio.");

    setIsSubmitting(true);

    try {
      // Step successivo: /api/register → Stripe Checkout
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: e1 }),
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

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      setError("Errore: URL pagamento mancante. Riprova.");
    } catch (err) {
      console.error("[signup] submit error:", err);
      setError("Errore di connessione. Controlla la rete e riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Luminous / Aurora background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute -top-44 -left-44 h-[620px] w-[620px] rounded-full bg-indigo-300/55 blur-[110px] mix-blend-multiply" />
        <div className="absolute top-1/4 -right-52 h-[680px] w-[680px] rounded-full bg-fuchsia-300/40 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-260px] left-1/3 h-[760px] w-[760px] rounded-full bg-sky-300/40 blur-[130px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_20%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_62%,rgba(255,255,255,0.85)_100%)]" />
      </div>

      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 lg:px-6 lg:py-14">
        <div className="w-full max-w-3xl">
          <Card className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-2xl opacity-90 shadow-lg"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)",
                    }}
                  />
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white/85 ring-1 ring-white/70">
                    <Image
                      src="/branding/cerbero-logo.svg"
                      alt="Cerbero AI logo"
                      width={30}
                      height={30}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Cerbero
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    Crea il tuo{" "}
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Account
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Step 1 / 2
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              {/* FORM */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Attiva Cerbero Autopilot
                </h1>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Crea l’account e prosegui al pagamento. Dopo l’attivazione potrai
                  accedere alla dashboard e collegare il tuo broker MT5.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                  <div>
                    <label className="text-[12px] font-bold text-slate-600">
                      Nome e cognome
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Mario Rossi"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-slate-600">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@esempio.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-slate-600">
                      Conferma email
                    </label>
                    <input
                      type="email"
                      value={emailConfirm}
                      onChange={(e) => setEmailConfirm(e.target.value)}
                      placeholder="ripeti l’email"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      autoComplete="email"
                    />
                  </div>

                  <label className="mt-2 flex items-start gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 text-[12px] font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span>
                      Confermo di aver letto e accettato termini, privacy e rischi del servizio.
                      Capisco che il trading comporta possibilità di perdita del capitale.
                    </span>
                  </label>

                  {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12px] font-semibold text-rose-800">
                      {error}
                    </div>
                  )}

                  <PrimaryButton type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? "Reindirizzamento al pagamento…" : "Crea account e continua"}
                  </PrimaryButton>

                  <div className="text-center text-[12px] font-semibold text-slate-500">
                    Hai già un account?{" "}
                    <a
                      href="/login"
                      className="font-bold text-slate-700 hover:text-slate-900"
                    >
                      Accedi
                    </a>
                  </div>
                </form>
              </div>

              {/* INFO BOX */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Autopilot · Inclusi
                </div>

                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="font-extrabold">Autopilot — 99€/mese</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-600">
                      Accesso alla dashboard + esecuzione automatizzata secondo i parametri Cerbero.
                    </div>
                  </div>

                  <ul className="space-y-2 text-[12px] font-semibold text-slate-600">
                    <li>• Accesso passwordless via email</li>
                    <li>• Controllo Autopilot ON/OFF</li>
                    <li>• Collegamento broker MT5 (step successivo)</li>
                  </ul>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-[12px] font-semibold text-slate-600">
                    Nessun vincolo annuale. Puoi disattivare quando vuoi.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
