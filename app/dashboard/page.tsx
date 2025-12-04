'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TransakModal } from '@/components/TransakModal';
import { buildTransakUrl } from '@/lib/transak';

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
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

type MovementRow = {
  id: string;
  date: string;
  type: string;
  detail: string;
  chain: string;
  amount: string;
  isPositive: boolean;
};

function formatAddress(addr: string | null | undefined) {
  if (!addr || addr.length < 10) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatNumber(n: number, decimals = 2) {
  return n.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// fallback PnL finto per ora
const mockPnl = {
  today: '+2,3%',
  month: '+12,4%',
};

// dati demo se non arrivano movimenti reali
const demoFeedData = [
  { type: 'PROFIT', symbol: 'EUR/USD', action: 'CLOSE LONG', value: '+0,85%', time: 'Just now', icon: '🟢' },
  { type: 'AI_LOG', symbol: 'SYSTEM', action: 'SCANNING', value: 'Volatility Analysis: LOW', time: '10 sec ago', icon: '🔵' },
  { type: 'ENTRY', symbol: 'XAU/USD', action: 'OPEN LONG', value: '@ 2048.50', time: '2 min ago', icon: '⚡' },
  { type: 'PROFIT', symbol: 'BTC/USD', action: 'TP HIT', value: '+2,1%', time: '5 min ago', icon: '🟢' },
  { type: 'RISK', symbol: 'GUARD', action: 'PROTECTION', value: 'Stop Loss Trailing Active', time: '8 min ago', icon: '🛡️' },
  { type: 'ENTRY', symbol: 'NAS100', action: 'OPEN SHORT', value: 'Pattern A+ Detected', time: '12 min ago', icon: '⚡' },
];

export default function DashboardPage() {
  // ======================
  // STATE SESSIONE & DATI
  // ======================
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);

  const [balanceUSDC, setBalanceUSDC] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  // Transak
  const [isTransakOpen, setIsTransakOpen] = useState(false);
  const [transakMode, setTransakMode] = useState<'BUY' | 'SELL'>('BUY');

  // ======================
  // EFFECT: /api/me
  // ======================
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
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok || !data?.ok) throw new Error('invalid session');

        setUserEmail(data.email ?? null);
        setUserWallet(data.wallet ?? null);
      } catch (err) {
        console.error('[dashboard] /api/me error:', err);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cerbero_session');
          window.location.href = '/login';
        }
      }
    };

    loadMe();
  }, []);

  // ======================
  // EFFECT: /api/tenant/summary
  // ======================
  useEffect(() => {
    const loadBalance = async () => {
      if (!userEmail && !userWallet) return;

      setIsLoadingBalance(true);

      try {
        const params = new URLSearchParams();
        if (userEmail) params.set('email', userEmail);
        else if (userWallet) params.set('walletMagic', userWallet);

        const res = await fetch(`/api/tenant/summary?${params.toString()}`);

        if (!res.ok) {
          console.error('[/api/tenant/summary] non ok:', res.status);
          setIsLoadingBalance(false);
          return;
        }

        const data = await res.json();
        if (!data?.ok) {
          console.error('[/api/tenant/summary] risposta ko:', data);
          setIsLoadingBalance(false);
          return;
        }

        setBalanceUSDC(Number(data.balanceUSDC) || 0);
      } catch (err) {
        console.error('[/api/tenant/summary] errore fetch:', err);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadBalance();
  }, [userEmail, userWallet]);

  // ======================
  // EFFECT: /api/tenant/movements
  // ======================
  useEffect(() => {
    const loadMovements = async () => {
      if (!userEmail && !userWallet) return;

      setIsLoadingMovements(true);

      try {
        const params = new URLSearchParams();
        if (userEmail) params.set('email', userEmail);
        else if (userWallet) params.set('walletMagic', userWallet);

        const res = await fetch(`/api/tenant/movements?${params.toString()}`);

        if (!res.ok) {
          console.error('[/api/tenant/movements] non ok:', res.status);
          setIsLoadingMovements(false);
          return;
        }

        const data = await res.json();
        if (!data?.ok) {
          console.error('[/api/tenant/movements] risposta ko:', data);
          setIsLoadingMovements(false);
          return;
        }

        const rows: MovementRow[] = (data.movements || []).map((m: any) => {
          const createdAt = m.createdAt ? new Date(m.createdAt) : null;
          const dateStr = createdAt
            ? createdAt.toLocaleString('it-IT', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          const isPositive = (m.rawAmount ?? 0) >= 0;

          return {
            id: m.id,
            date: dateStr,
            type: m.labelType || m.type || 'Movimento',
            detail: m.detail || 'Movimento saldo',
            chain:
              m.chain === 'arbitrum_one' ? 'Arbitrum' : m.chain || 'Arbitrum',
            amount: m.amount,
            isPositive,
          };
        });

        setMovements(rows);
      } catch (err) {
        console.error('[/api/tenant/movements] errore fetch:', err);
      } finally {
        setIsLoadingMovements(false);
      }
    };

    loadMovements();
  }, [userEmail, userWallet]);

  // ======================
  // Transak URL dinamico
  // ======================
  const transakUrl = useMemo(() => {
    if (!userEmail || !userWallet) return null;

    return buildTransakUrl({
      email: userEmail,
      walletAddress: userWallet,
    });
  }, [userEmail, userWallet, transakMode]);

  const isCaricaFondiDisabled = !transakUrl || isLoadingBalance;

  const displayBalanceUSDC =
    balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : '—';

  const displayBalanceEUR =
    balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : '—';

  // feed: usa movimenti reali se ci sono, altrimenti demo
  const activityItems =
    movements.length > 0
      ? movements.map((m) => ({
          type: m.type.toUpperCase(),
          symbol: m.detail || m.type,
          action: m.chain,
          value: m.amount,
          time: m.date,
          icon: m.isPositive ? '🟢' : '🔴',
        }))
      : demoFeedData;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background in stile Home */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-fuchsia-600/40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full bg-violet-500/30 blur-3xl" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/0 to-black/85" />

      {/* CONTENUTO */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-6 lg:py-14">
        {/* Header Dashboard */}
        <motion.section
          variants={sectionContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
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
                Cerbero Dashboard
              </span>
              <span className="text-sm font-semibold">
                La tua{' '}
                <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                  Coscienza Finanziaria
                </span>{' '}
                in tempo reale.
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center gap-3 text-[11px] text-white/60"
          >
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              Data driven since 2020
            </span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              Autotrading attivo
            </span>
          </motion.div>
        </motion.section>

        {/* GRID PRINCIPALE */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Colonna sinistra: Wallet + Performance */}
          <div className="space-y-6">
            {/* Carta Wallet */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black/90 p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.6)]"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-white/60">Wallet personale</p>
                  <p className="mt-1 text-lg font-semibold">
                    Saldo:{' '}
                    <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                      {displayBalanceUSDC} USDC
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-white/55">
                    Wallet:{' '}
                    <span className="font-mono text-[10px] text-white/80">
                      {formatAddress(userWallet)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end text-[11px] text-white/60">
                  <span>
                    Oggi:{' '}
                    <span className="text-emerald-300">{mockPnl.today}</span>
                  </span>
                  <span>
                    Mese:{' '}
                    <span className="text-emerald-300">{mockPnl.month}</span>
                  </span>
                </div>
              </div>

              {/* Pulsanti Deposita / Preleva (logica Transak) */}
              <div className="mb-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isCaricaFondiDisabled) return;
                    setTransakMode('BUY');
                    setIsTransakOpen(true);
                  }}
                  disabled={isCaricaFondiDisabled}
                  className={`inline-flex flex-1 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium shadow-[0_0_25px_rgba(16,185,129,0.45)] transition ${
                    isCaricaFondiDisabled
                      ? 'cursor-not-allowed border-white/10 bg-white/10 text-slate-400'
                      : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:border-emerald-300 hover:bg-emerald-500/25'
                  }`}
                >
                  {isCaricaFondiDisabled
                    ? 'Deposita (attendi dati…)'
                    : 'Deposita'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isCaricaFondiDisabled) return;
                    setTransakMode('SELL');
                    setIsTransakOpen(true);
                  }}
                  disabled={isCaricaFondiDisabled}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-400"
                >
                  Preleva
                </button>
              </div>

              {/* Toggle Autotrading (solo UI per ora) */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-xs text-white/60">
                    Stato Autotrading
                  </span>
                  <span className="text-sm font-semibold text-emerald-300">
                    Cerbero è attivo
                  </span>
                </div>
                <div className="relative inline-flex items-center">
                  <div className="h-6 w-11 rounded-full bg-emerald-500/30 border border-emerald-300/60" />
                  <div className="absolute right-1 h-4 w-4 rounded-full bg-white shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                </div>
              </div>
            </motion.div>

            {/* Performance / PnL “sparkline” finta */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between text-xs text-white/60">
                <span>Andamento Performance</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/60">
                  Ultimi 30 giorni
                </span>
              </div>
              <div className="mt-2 flex h-24 items-end gap-1">
                {[35, 40, 55, 48, 70, 65, 90, 82, 100, 88, 95, 110].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-full bg-gradient-to-t from-emerald-500/30 via-emerald-300/70 to-emerald-200/90"
                      style={{ height: `${h}%` }}
                    />
                  ),
                )}
              </div>
              <p className="mt-3 text-[11px] text-white/55">
                Dati a scopo illustrativo. In questa sezione vedrai la
                performance reale del tuo wallet con Cerbero attivo.
              </p>
            </motion.div>
          </div>

          {/* Colonna destra: Live feed + Info */}
          <div className="space-y-6">
            {/* Live operations feed */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-slate-900/70 to-sky-500/15 p-4 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between text-[11px] text-white/70">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  Activity Log • {isLoadingMovements ? 'Loading…' : 'Live'}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100/80">
                  {movements.length > 0 ? 'Tenant data' : 'Demo data'}
                </span>
              </div>

              {/* Fade top/bottom */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-slate-950 via-slate-950/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="relative h-52 overflow-hidden">
                <motion.div
                  className="flex flex-col gap-2"
                  animate={{ y: ['0%', '-50%'] }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {[...activityItems, ...activityItems].map((item, idx) => (
                    <div
                      key={`${item.symbol}-${item.time}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-black/55 px-3 py-2 text-[11px] text-white/70 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white/85">
                            {item.type} • {item.symbol}
                          </span>
                          <span className="text-[10px] text-white/60">
                            {item.action}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={`text-[11px] ${
                            item.type === 'PROFIT'
                              ? 'text-emerald-300'
                              : item.type === 'ENTRY'
                              ? 'text-white'
                              : 'text-sky-300'
                          }`}
                        >
                          {item.value}
                        </span>
                        <span className="text-[9px] text-white/45">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Box info “step successivi” */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 backdrop-blur-xl"
            >
              <h2 className="text-sm font-semibold text-white/80">
                Cosa potrai fare da qui
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>• Collegare il tuo conto e attivare il widget di deposito.</li>
                <li>• Accendere o spegnere Cerbero con un solo interruttore.</li>
                <li>• Monitorare in tempo reale le operazioni della Coscienza.</li>
                <li>• Scaricare report e riepiloghi fiscali pronti all&apos;uso.</li>
              </ul>
              <p className="mt-3 text-[11px] text-white/50">
                Questa è una preview grafica. Nel prossimo step collegheremo la
                logica reale (Transak, Magic Link, Coordinator) mantenendo
                esattamente questo design.
              </p>
            </motion.div>
          </div>
        </section>

        {/* MODAL TRANSAK */}
        <TransakModal
          isOpen={isTransakOpen}
          onClose={() => setIsTransakOpen(false)}
          transakUrl={transakUrl}
          mode={transakMode}
        />
      </main>
    </div>
  );
}
