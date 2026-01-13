'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AccountV2Page() {
  const [email, setEmail] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [tradingAddress, setTradingAddress] = useState<string | null>(null);

  function authHeaders(): HeadersInit {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('cerbero_session')
        : null;

    const h: Record<string, string> = {};
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  useEffect(() => {
    const loadMe = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('cerbero_session')
          : null;

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/me', { headers: { ...authHeaders() } });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        localStorage.removeItem('cerbero_session');
        window.location.href = '/login';
        return;
      }

      setEmail(data.email ?? null);
      setWallet(data.wallet ?? null);

      if (data.tradingAddress) setTradingAddress(data.tradingAddress);

      // fallback: prova balance endpoint che spesso include tradingAddress
      if (!data.tradingAddress) {
        const r2 = await fetch('/api/coordinator/balance', { headers: { ...authHeaders() } }).catch(() => null);
        const d2 = r2 ? await r2.json().catch(() => null) : null;
        if (d2?.ok && typeof d2.tradingAddress === 'string') setTradingAddress(d2.tradingAddress);
      }
    };

    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-fuchsia-600/35 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full bg-violet-500/25 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:px-6 lg:py-14">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <Image
                src="/branding/cerbero-logo.svg"
                alt="Cerbero AI logo"
                width={40}
                height={40}
                className="object-contain drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Cerbero Account</span>
              <span className="text-sm font-semibold">
                Il tuo{' '}
                <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                  centro di controllo
                </span>
                .
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white hover:bg-white/15"
          >
            Torna alla Dashboard
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Left: Dati account */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/75 via-slate-950 to-black/90 p-5 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-white/85">Dati account</h2>
            <p className="mt-2 text-[12px] text-white/60">
              Email di accesso e wallet Magic collegato.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Email</p>
                    <p className="mt-1 text-sm text-white/85">{email ?? '—'}</p>
                  </div>
                  {email && (
                    <button
                      onClick={() => copy(email)}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/80 hover:bg-white/15"
                    >
                      Copia
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Wallet (Magic)</p>
                    <p className="mt-1 font-mono text-sm text-white/85 break-all">{wallet ?? '—'}</p>
                  </div>
                  {wallet && (
                    <button
                      onClick={() => copy(wallet)}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/80 hover:bg-white/15"
                    >
                      Copia
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-white/50">
                  Il wallet Magic serve per login e firme. Cerbero non vede mai la chiave privata.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Conto DeFi (Smart Contract)</p>
                    <p className="mt-1 font-mono text-sm text-white/85 break-all">{tradingAddress ?? '—'}</p>
                  </div>
                  {tradingAddress && (
                    <button
                      onClick={() => copy(tradingAddress)}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/80 hover:bg-white/15"
                    >
                      Copia
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-white/50">
                  Questo è il contratto dove risiedono i fondi DeFi. Non è un wallet EOA.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Sicurezza */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-white/85">Sicurezza & chiave privata</h2>
            <p className="mt-2 text-[12px] text-white/60">
              Export della chiave gestita da Magic (consigliato subito dopo attivazione).
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Export</p>
              <p className="mt-2 text-sm text-white/80">
                Apri il Magic Wallet ufficiale con la stessa email e completa l’export in modo sicuro.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="https://magic.link/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white hover:bg-white/15"
                >
                  Apri Magic Wallet
                </a>
              </div>

              <ul className="mt-4 space-y-2 text-[12px] text-white/65">
                <li>• Non salvare mai la chiave in chat o email.</li>
                <li>• Usa password manager o supporto fisico sicuro.</li>
                <li>• Con la chiave puoi recuperare il wallet anche senza Cerbero.</li>
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Canale CeFi</p>
              <p className="mt-2 text-sm text-white/75">
                La connessione al broker verrà gestita dalla dashboard. Cerbero invia ordini via API, senza custodia fondi.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
