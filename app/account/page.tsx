'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type MeResponse = {
  ok: boolean;
  email?: string;
  wallet?: string;
};

function formatAddress(addr: string | null | undefined) {
  if (!addr || addr.length < 10) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const sectionContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [isLoadingMe, setIsLoadingMe] = useState(true);

  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadMe = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('cerbero_session')
          : null;

      if (!token) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: MeResponse = await res.json();

        if (!res.ok || !data?.ok) throw new Error('invalid session');

        setEmail(data.email ?? null);
        setWallet(data.wallet ?? null);
      } catch (err) {
        console.error('[account] /api/me error:', err);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cerbero_session');
          window.location.href = '/login';
        }
      } finally {
        setIsLoadingMe(false);
      }
    };

    loadMe();
  }, []);

  const handleCopy = async (value: string | null, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copiata negli appunti`);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Clipboard error:', err);
      setCopyStatus('Impossibile copiare. Copia manualmente.');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background stile home/dashboard */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-fuchsia-600/40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full bg-violet-500/30 blur-3xl" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/0 to-black/85" />

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:px-6 lg:py-14">
        {/* HEADER */}
        <motion.header
          variants={sectionContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          {/* TITOLO + TESTO */}
          <div className="space-y-3 md:max-w-xl">
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
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
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                  Cerbero Account
                </span>
                <span className="text-sm font-semibold">
                  Il tuo{' '}
                  <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                    centro di controllo
                  </span>{' '}
                  personale.
                </span>
              </div>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="max-w-2xl text-sm leading-relaxed text-white/75"
            >
              Da questa pagina puoi verificare i tuoi dati, il tuo wallet su
              Arbitrum One e accedere al pannello Magic per esportare la tua
              chiave privata.
              <span className="mt-1 block text-xs text-amber-300/95">
                Importante: Cerbero non conserva mai la tua chiave privata. Sei
                tu l&apos;unico proprietario del tuo wallet.
              </span>
            </motion.p>
          </div>

          {/* BOTTONE RITORNO DASHBOARD */}
          <motion.div
            variants={fadeInUp}
            className="mt-2 flex justify-start md:mt-0 md:justify-end"
          >
            <Link
              href="/dashboard"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/80 hover:bg-white/10"
            >
              Torna alla dashboard
            </Link>
          </motion.div>
        </motion.header>

        {/* CARDS PRINCIPALI */}
        <motion.section
          variants={sectionContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2"
        >
          {/* CARD DATI ACCOUNT */}
          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black/90 p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.6)]"
          >
            <h2 className="text-sm font-semibold text-white/85">Dati account</h2>
            <p className="mt-1 text-[11px] text-white/60">
              Email di accesso e wallet Magic collegato alla tua Coscienza
              Finanziaria.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                  Email
                </span>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/80">
                  <span className="truncate">
                    {isLoadingMe ? 'Caricamento…' : email || '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(email, 'Email')}
                    disabled={!email}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Copia
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                  Wallet (Arbitrum One)
                </span>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/80">
                  <span className="font-mono text-[11px]">
                    {isLoadingMe ? 'Caricamento…' : formatAddress(wallet)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(wallet, 'Indirizzo wallet')}
                    disabled={!wallet}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Copia
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-white/50">
              Puoi usare questo indirizzo in qualsiasi wallet compatibile con
              Arbitrum One per visualizzare e gestire i tuoi fondi anche al di
              fuori di Cerbero.
            </p>
          </motion.div>

          {/* CARD SICUREZZA / CHIAVE PRIVATA */}
          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-slate-950 to-black/90 p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.7)]"
          >
            <h2 className="text-sm font-semibold text-amber-100">
              Sicurezza &amp; chiave privata
            </h2>
            <p className="mt-1 text-[11px] text-amber-100/80">
              Qui trovi le istruzioni per esportare la tua chiave privata Magic
              in modo sicuro. Cerbero non può vederla né recuperarla al posto
              tuo.
            </p>

            <div className="mt-4 rounded-2xl border border-amber-400/30 bg-black/60 px-3 py-3 text-xs text-white/80">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-amber-200/80">
                  Esporta la tua chiave privata
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">
                  Gestito da Magic
                </span>
              </div>

              <p className="mb-2 text-[11px] text-white/65">
                Per esportare la tua chiave privata, apri il Magic Wallet
                ufficiale. Usa la stessa email che utilizzi su Cerbero: riceverai
                un codice via email e potrai visualizzare e salvare la tua frase
                segreta.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href="https://wallet.magic.link"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-[11px] font-medium text-amber-100 hover:bg-amber-500/20"
                >
                  Apri Magic Wallet
                </a>
                <span className="text-[11px] text-amber-100/70">
                  Suggerito: esporta e salva la chiave subito dopo la creazione
                  del tuo account.
                </span>
              </div>

              <ul className="mt-3 space-y-1.5 text-[11px] text-amber-100/80">
                <li>• Non salvare mai la chiave privata in chat o email.</li>
                <li>• Preferisci un password manager o supporto fisico sicuro.</li>
                <li>
                  • Con la chiave privata puoi sempre recuperare il tuo wallet,
                  anche senza Cerbero.
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.section>

        {copyStatus && (
          <div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/80 px-4 py-2 text-xs text-white/80 backdrop-blur-xl">
            {copyStatus}
          </div>
        )}
      </main>
    </div>
  );
}
