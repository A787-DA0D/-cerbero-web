"use client";

import React, { useState } from "react";
import { Magic } from "magic-sdk";

// Singleton Magic (client-side)
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
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const m = getMagic();
      const didToken = await m.auth.loginWithMagicLink({ email });

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { Authorization: `Bearer ${didToken}` },
      });

      const data = await res.json();
      if (!res.ok || !data.sessionToken)
        throw new Error(data.error || "Login non riuscito");

      localStorage.setItem("cerbero_session", data.sessionToken);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Login non riuscito. Riprova tra qualche secondo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#050816] bg-gradient-to-b from-[#050816] via-[#040414] to-[#050816]">
      <div className="max-w-5xl w-full mx-auto">
        <div className="relative mx-auto flex flex-col md:flex-row gap-10 rounded-[32px] bg-black/40 border border-white/10 px-8 py-10 md:px-12 md:py-12 backdrop-blur-2xl shadow-[0_35px_120px_rgba(0,0,0,0.65)]">
          
          {/* Colonna sinistra (testo) */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cerbero App · Accesso Sicuro
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Accedi a Cerbero
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                Entra nella tua dashboard e controlla il tuo pilota Autopilot,
                saldo e operatività.  
                Login{" "}
                <span className="font-semibold text-white">senza password</span>:  
                ricevi un link magico via email.
              </p>
            </div>

            <ul className="space-y-2 text-sm text-white/75">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Smart contract 1-a-1 su Arbitrum One.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Login gestito da Magic Link + Google Cloud.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Nessuna password: solo la tua email personale.
              </li>
            </ul>

            <p className="text-[11px] text-white/40">
              Nessuna consulenza finanziaria. Il capitale resta nel tuo smart
              contract personale.
            </p>
          </div>

          {/* Colonna destra (login card) */}
          <div className="flex-1">
            <div className="mx-auto max-w-md rounded-3xl bg-black/50 border border-white/10 px-6 py-7 md:px-7 md:py-8 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.85)]">
              
              <div className="flex items-center justify-between text-[11px] font-medium text-white/70 mb-4">
                <span className="uppercase tracking-[0.15em] text-white/50">
                  Accesso
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Coscienza AI attiva
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-white/80"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="nome@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  />
                  <p className="text-[11px] text-white/40">
                    Login crittografato tramite Magic Link.
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-rose-400 bg-rose-900/40 border border-rose-500/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-white text-[#0a1020] text-sm font-semibold py-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.6)] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Invio link magico..." : "Entra con link via email"}
                </button>

                <div className="flex items-center justify-between pt-3 text-[11px] text-white/50">
                  <span>Non hai un account?</span>
                  <a
                    href="/signup"
                    className="font-medium text-white/80 hover:underline"
                  >
                    Registrati
                  </a>
                </div>
              </form>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
