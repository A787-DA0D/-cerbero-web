"use client";

import React, { useEffect, useState } from "react";
import { Magic } from "magic-sdk";
import Image from "next/image";

// Istanza singleton di Magic sul client
let magic: Magic | null = null;

function getMagic() {
  if (!magic) {
    const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
    if (!key) throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY mancante");
    magic = new Magic(key);
  }
  return magic;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function exchangeDidTokenAndGo(didToken: string) {
    // 2) Mandiamo il DID token al backend
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${didToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.sessionToken) {
      throw new Error(data.error || "Login non riuscito");
    }

    // 3) Salviamo il token di sessione
    localStorage.setItem("cerbero_session", data.sessionToken);

    // 4) Redirect alla dashboard
    window.location.href = "/dashboard";
  }

  // ✅ AUTO-LOGIN quando rientri dal link Magic (magic_credential in query)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const credential = params.get("magic_credential");

    if (!credential) return;

    (async () => {
      setLoading(true);
      setError(null);
      setStatusText("Accesso in corso...");

      try {
        const m = getMagic();

        // ✅ FIX TYPES: vuole un oggetto, non una stringa
        const didToken = await (m.auth as any).loginWithCredential(credential);

        // pulizia URL (toglie magic_credential)
        window.history.replaceState({}, "", "/login");

        if (!didToken) {
          throw new Error("DID token mancante (magic link non valido o scaduto)");
        }
        await exchangeDidTokenAndGo(didToken);
      } catch (err) {
        console.error(err);
        setError("Login non riuscito. Riprova tra qualche secondo.");
        setStatusText(null);
        setLoading(false);
      }
    })();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusText("Invio link magico...");

    try {
      const m = getMagic();

      // 1) Magic invia la mail e genera il DID token
      const didToken = await m.auth.loginWithMagicLink({ email });

      // 2-4) Backend + session + redirect
      if (!didToken) {
        throw new Error("Magic DID token mancante o non valido");
      }

      await exchangeDidTokenAndGo(didToken);
    } catch (err) {
      console.error(err);
      setError("Login non riuscito. Riprova tra qualche secondo.");
      setStatusText(null);
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-none text-white">
      {/* VIDEO DI SFONDO */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/login-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* CONTENUTO */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-5xl w-full mx-auto">
          <div className="mx-auto flex flex-col md:flex-row gap-10 rounded-[32px] bg-black/60 border border-white/10 px-8 py-10 md:px-12 md:py-12 shadow-[0_40px_120px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            {/* Colonna sinistra */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full bg-cyan-400/35 blur-xl opacity-70 animate-pulse"
                    aria-hidden
                  />
                  <Image
                    src="/branding/cerbero-logo.svg"
                    alt="Cerbero AI logo"
                    width={56}
                    height={56}
                    className="relative z-10 select-none pointer-events-none drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]"
                  />
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold tracking-tight text-white">
                    Cerbero <span className="text-emerald-300">AI</span>
                  </span>
                  <span className="text-[11px] text-white/60">
                    Switch On. Sit back. Relax.
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium tracking-wide uppercase text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cerbero App · Accesso sicuro
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                  Accedi a Cerbero <span className="text-emerald-300">AI</span>
                </h1>
                <p className="mt-3 text-sm md:text-base text-slate-300/90 leading-relaxed">
                  Login <span className="font-semibold text-white">senza password</span>:
                  ti inviamo un link magico via email, valido solo per te.
                </p>
              </div>

              <ul className="space-y-2 text-sm text-slate-200/90">
                <li className="flex items-start gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Smart contract 1-a-1 su Arbitrum One.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Login gestito da Magic Link + stack Google Cloud.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Nessuna password da ricordare, solo la tua email personale.</span>
                </li>
              </ul>

              <p className="text-[11px] text-slate-400">
                Nessuna consulenza finanziaria. Il capitale è sempre nel tuo smart contract 1-a-1.
              </p>
            </div>

            {/* Colonna destra */}
            <div className="flex-1">
              <div className="mx-auto max-w-md rounded-3xl bg-slate-950/80 border border-white/15 px-6 py-7 md:px-7 md:py-8 shadow-[0_30px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-4">
                  <span className="uppercase tracking-[0.15em] text-slate-400">
                    Accesso
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Coscienza AI attiva
                  </span>
                </div>

                {statusText && (
                  <p className="text-xs text-slate-200 bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3">
                    {statusText}
                  </p>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-slate-200">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="nome@esempio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70"
                    />
                    <p className="text-[11px] text-slate-500">
                      Usiamo Magic Link per autenticarti in modo crittografato.
                    </p>
                  </div>

                  {error && (
                    <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-white text-slate-950 text-sm font-semibold py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.7)] hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Invio..." : "Entra con link via email"}
                  </button>

                  <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500">
                    <span>Non hai ancora un account?</span>
                    <button
                      type="button"
                      className="font-medium text-slate-200 hover:underline"
                      onClick={() => (window.location.href = "/signup")}
                    >
                      Registrati
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* Fine colonna destra */}
          </div>
        </div>
      </div>
    </main>
  );
}
