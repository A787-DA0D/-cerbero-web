'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Magic } from 'magic-sdk';
import { BrowserProvider, Contract, parseUnits } from 'ethers';

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
  txHash?: string | null;
  source?: string | null;
};

type ActivityItem = {
  type: string;
  symbol: string;
  action: string;
  value: string;
  time: string;
  icon: string;
  intent: 'DEPOSIT' | 'WITHDRAW' | 'TRADE' | 'INFO';
  isPositive?: boolean;
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

/** =========
 *  ONCHAIN CONSTANTS (Arbitrum One)
 *  ========= */
const CHAIN_ID = 42161;
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const USDC_DECIMALS = 6;

const TA_ABI = [
  'function owner()(address)',
  'function nonces(address)(uint256)',
];

function toUSDCBaseUnits(value: string) {
  try {
    const normalized = value.replace(',', '.').trim();
    return parseUnits(normalized, USDC_DECIMALS);
  } catch {
    return null;
  }
}

function getMagicArbitrum() {
  const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
  const rpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;
  if (!key) throw new Error('NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY mancante');
  if (!rpcUrl) throw new Error('NEXT_PUBLIC_ARBITRUM_RPC_URL mancante');
  return new Magic(key, { network: { rpcUrl, chainId: CHAIN_ID } });
}

export default function DashboardPage() {
  // ======================
  // STATE SESSIONE & DATI
  // ======================
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null); // EOA Magic (solo “identità”)
  const [tradingAddress, setTradingAddress] = useState<string | null>(null); // TA (wallet reale fondi)

  const [balanceUSDC, setBalanceUSDC] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const [pnlTodayPct, setPnlTodayPct] = useState<number | null>(null);
  const [pnlMonthPct, setPnlMonthPct] = useState<number | null>(null);

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  // Autotrading
  const [isAutotradingOn, setIsAutotradingOn] = useState<boolean | null>(null);
  const [isTogglingAutotrading, setIsTogglingAutotrading] = useState(false);
  const [autotradingMessage, setAutotradingMessage] = useState<string | null>(null);

  // Messaggio per deposito/prelievo bloccati
  const [fundsWarning, setFundsWarning] = useState<string | null>(null);

  // Deposito tutorial modal
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // Withdraw UI
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawTo, setWithdrawTo] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // ======================
  // EFFECT: /api/me
  // ======================
  useEffect(() => {
    const loadMe = async () => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('cerbero_session') : null;

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
// EFFECT: /api/tenant/movements  (AUTH)
// ======================
useEffect(() => {
  const loadMovements = async () => {
    if (!userEmail && !userWallet) return;

    setIsLoadingMovements(true);

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('cerbero_session')
          : null;

      const res = await fetch('/api/tenant/movements', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

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
          chain: m.chain === 'arbitrum_one' ? 'Arbitrum' : m.chain || 'Arbitrum',
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
  // EFFECT: /api/tenant/movements
  // ======================
  useEffect(() => {
    const loadMovements = async () => {
      if (!userEmail && !userWallet) return;

      setIsLoadingMovements(true);

      try {
        // Manteniamo compatibilità con la route attuale: usa email o walletMagic
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('cerbero_session')
            : null;

        const res = await fetch('/api/tenant/movements', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          console.error('[/api/tenant/movements] non ok:', res.status);
          return;
        }

        const data = await res.json();
        if (!data?.ok) {
          console.error('[/api/tenant/movements] risposta ko:', data);
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
            chain: m.chain === 'arbitrum_one' ? 'Arbitrum' : m.chain || 'Arbitrum',
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

  const displayBalanceUSDC = balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : '—';
  const displayBalanceEUR = balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : '—';
  const displayPnlToday = pnlTodayPct !== null ? `${pnlTodayPct.toFixed(2)}%` : '—';
  const displayPnlMonth = pnlMonthPct !== null ? `${pnlMonthPct.toFixed(2)}%` : '—';

  // ======================
  // Autotrading toggle handler
  // ======================
  const handleToggleAutotrading = async () => {
    if (isAutotradingOn === null || isTogglingAutotrading) return;

    if (!userEmail) {
      setAutotradingMessage('Sessione non valida: email mancante. Esegui di nuovo il login.');
      return;
    }

    const nextValue = !isAutotradingOn;
    setIsTogglingAutotrading(true);
    setAutotradingMessage(null);

    try {
      const res = await fetch('/api/autotrading/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, enabled: nextValue }),
      });

      if (!res.ok) {
        console.error('/api/autotrading/toggle non ok:', res.status);
        setAutotradingMessage('Non riesco a cambiare lo stato ora. Riprova tra qualche istante.');
        return;
      }

      setIsAutotradingOn(nextValue);
    } catch (err) {
      console.error('/api/autotrading/toggle errore:', err);
      setAutotradingMessage('Errore di connessione. Controlla la rete e riprova.');
    } finally {
      setIsTogglingAutotrading(false);
    }
  };

  // ======================
  // Handlers Deposita / Preleva
  // ======================
  const handleClickDeposita = () => {
    if (isAutotradingOn) {
      setFundsWarning("Per depositare, disattiva prima l'autotrading usando l'interruttore.");
      setTimeout(() => setFundsWarning(null), 4000);
      return;
    }
    setIsDepositOpen(true);
  };

  const handleClickPreleva = () => {
    if (isAutotradingOn) {
      setFundsWarning("Per prelevare, disattiva prima l'autotrading usando l'interruttore.");
      setTimeout(() => setFundsWarning(null), 4000);
      return;
    }
    setIsWithdrawOpen(true);
  };

  // ======================
  // Withdraw: Magic + EIP-712 + /api/withdraw
  // ======================
  const handleWithdraw = async () => {
    try {
      setWithdrawStatus(null);
      setWithdrawTxHash(null);

      if (!tradingAddress) {
        setWithdrawStatus('Trading account non disponibile. Riprova tra poco.');
        return;
      }

      const to = withdrawTo.trim();
      if (!to || !to.startsWith('0x') || to.length < 42) {
        setWithdrawStatus('Indirizzo destinatario non valido.');
        return;
      }

      const amountBase = toUSDCBaseUnits(withdrawAmount);
      const ZERO = BigInt(0);
      if (amountBase === null || amountBase <= ZERO) {
        setWithdrawStatus('Importo non valido.');
        return;
      }

      setIsWithdrawing(true);
      setWithdrawStatus('Login Magic + firma in corso...');

      const magic = getMagicArbitrum();
      const provider = new BrowserProvider(magic.rpcProvider as any);
      const signer = await provider.getSigner();

      const ownerAddr = await signer.getAddress();

      // nonce = nonces[owner]
      const ta = new Contract(tradingAddress, TA_ABI, provider);
      const nonce: bigint = await ta.nonces(ownerAddr);

      const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 min

      const domain = {
        name: 'CerberoTradingAccount',
        version: '1',
        chainId: CHAIN_ID,
        verifyingContract: tradingAddress,
      };

      const types = {
        Withdraw: [
          { name: 'token', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message = {
        token: USDC,
        to,
        amount: amountBase.toString(),
        nonce: nonce.toString(),
        deadline,
      };

      const sig = await signer.signTypedData(domain as any, types as any, message as any);

      setWithdrawStatus('Invio al relayer...');

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('cerbero_session')
          : null;

      const resp = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          to,
          amount: amountBase.toString(),
          deadline,
          sig,
        }),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data?.ok) {
        setWithdrawStatus(data?.error || 'Errore prelievo.');
        return;
      }

      setWithdrawTxHash(data.txHash);
      setWithdrawStatus('✅ Prelievo inviato correttamente.');

      // reset campi
      setWithdrawAmount('');
      // non resetto "to" così se vuoi ripetere è più comodo
    } catch (e: any) {
      setWithdrawStatus(e?.message || 'Errore inatteso.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ======================
  // Activity feed: SOLO dati reali
  // ======================
  // Mostriamo il feed SOLO quando c'è almeno una tx on-chain reale
  const hasRealTx = movements.some((m) => {
    const h = (m.txHash || '').toString();
    return h.startsWith('0x') && h.length >= 20;
  });

  const realMovements = movements.filter((m) => {
    const h = (m.txHash || '').toString();
    // Consideriamo 'reale' se ha un tx hash plausibile
    return h.startsWith('0x') && h.length >= 20;
  });

  const activityItems: ActivityItem[] = (hasRealTx ? realMovements : []).map((m) => {
    const upType = (m.type || '').toUpperCase();

    let intent: ActivityItem['intent'] = 'TRADE';
    if (upType.includes('DEPOSIT') || upType.includes('DEPOSITO')) intent = 'DEPOSIT';
    else if (upType.includes('WITHDRAW') || upType.includes('PRELIEVO')) intent = 'WITHDRAW';

    return {
      type: m.type || 'Movimento',
      symbol: m.detail || m.type || 'Movimento saldo',
      action: m.chain,
      value: m.amount,
      time: m.date,
      icon:
        intent === 'DEPOSIT'
          ? '⬆️'
          : intent === 'WITHDRAW'
          ? '⬇️'
          : m.isPositive
          ? '🟢'
          : '🔴',
      intent,
      isPositive: m.isPositive,
    };
  });

  const tradingDisplay = tradingAddress ? formatAddress(tradingAddress) : '—';

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-fuchsia-600/40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full bg-violet-500/30 blur-3xl" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/0 to-black/85" />

      {/* CONTENT */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-6 lg:py-14">
        {/* Header */}
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
            <span
              className={`rounded-full border px-3 py-1 ${
                isAutotradingOn
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
              }`}
            >
              {isAutotradingOn ? 'Autotrading attivo' : 'Autotrading disattivato'}
            </span>
            <Link
              href="/account"
              className="ml-auto rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white hover:bg-white/15"
            >
              Vai al tuo Account
            </Link>
          </motion.div>
        </motion.section>

        {/* GRID */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* WALLET CARD */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black/90 p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.6)]"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-white/60">Trading Account (Arbitrum One)</p>
                  <p className="mt-1 text-lg font-semibold">
                    Saldo:{' '}
                    <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                      {displayBalanceUSDC} USDC
                    </span>
                  </p>

                  <p className="mt-1 text-[11px] text-white/55">
                    Trading Account:{' '}
                    <span className="font-mono text-[10px] text-white/80">{tradingDisplay}</span>
                  </p>

                  <p className="mt-1 text-[11px] text-white/55">
                    Equivalente stimato: € {displayBalanceEUR}
                  </p>
                </div>
                <div className="flex flex-col items-end text-[11px] text-white/60">
                  <span>
                    Oggi: <span className="text-emerald-300">{displayPnlToday}</span>
                  </span>
                  <span>
                    Mese: <span className="text-emerald-300">{displayPnlMonth}</span>
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mb-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleClickDeposita}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.45)] transition hover:border-emerald-300 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-400"
                  disabled={isLoadingBalance}
                >
                  Deposita
                </button>
                <button
                  type="button"
                  onClick={handleClickPreleva}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-gradient-to-r from-sky-500/15 via-blue-500/20 to-fuchsia-500/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-400"
                  disabled={isLoadingBalance}
                >
                  Preleva
                </button>
              </div>

              {fundsWarning && <p className="mb-3 text-[11px] text-amber-300">{fundsWarning}</p>}

              {/* AUTOTRADING TOGGLE */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-xs text-white/60">Stato Autotrading</span>
                  <span
                    className={`text-sm font-semibold ${
                      isAutotradingOn ? 'text-emerald-300' : 'text-amber-300'
                    }`}
                  >
                    {isAutotradingOn ? 'Cerbero è attivo' : 'Cerbero è disattivato'}
                  </span>
                  {autotradingMessage && (
                    <span className="mt-1 text-[11px] text-amber-300">{autotradingMessage}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutotrading}
                  className="relative inline-flex h-7 w-12 items-center rounded-full border border-white/20 bg-white/5 px-1 transition"
                  disabled={isAutotradingOn === null || isTogglingAutotrading}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-[0_0_12px_rgba(16,185,129,0.9)] transition-transform ${
                      isAutotradingOn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* PERFORMANCE CARD */}
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
                {[35, 40, 55, 48, 70, 65, 90, 82, 100, 88, 95, 110].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-full bg-gradient-to-t from-emerald-500/30 via-emerald-300/70 to-emerald-200/90"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[11px] text-white/55">
                Grafico illustrativo. Le percentuali giornaliere e mensili in alto usano i dati reali del tuo
                wallet.
              </p>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* LIVE FEED */}
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
                  {movements.length > 0 ? 'Tenant data' : 'In attesa di movimenti'}
                </span>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-slate-950 via-slate-950/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="relative h-52 overflow-hidden">
                {!hasRealTx || activityItems.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-2xl bg-black/40 px-3 py-2 text-[11px] text-white/50">
                    Ancora nessun movimento. I tuoi depositi, prelievi e PnL appariranno qui in tempo reale.
                  </div>
                ) : (
                  <motion.div
                    className="flex flex-col gap-2"
                    animate={{ y: ['0%', '-50%'] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                  >
                    {[...activityItems, ...activityItems].map((item, idx) => {
                      let valueColor = 'text-white';

                      if (item.intent === 'WITHDRAW') valueColor = 'text-cyan-300';
                      else if (item.intent === 'TRADE') valueColor = item.isPositive ? 'text-emerald-300' : 'text-red-400';
                      else if (item.intent === 'INFO') valueColor = 'text-sky-300';

                      return (
                        <div
                          key={`${item.symbol}-${item.time}-${idx}`}
                          className="flex items-center justify-between rounded-xl border border-white/8 bg-black/55 px-3 py-2 text-[11px] text-white/70 backdrop-blur-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.icon}</span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-white/85">
                                {item.type.toUpperCase()} • {item.symbol}
                              </span>
                              <span className="text-[10px] text-white/60">{item.action}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`text-[11px] ${valueColor}`}>{item.value}</span>
                            <span className="text-[9px] text-white/45">{item.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* INFO BOX */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 backdrop-blur-xl"
            >
              <h2 className="text-sm font-semibold text-white/80">Cosa potrai fare da qui</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>• Depositare USDC sul tuo Trading Account (Arbitrum One).</li>
                <li>• Prelevare con firma Magic (bank-grade).</li>
                <li>• Accendere o spegnere Cerbero con un solo interruttore.</li>
                <li>• Monitorare in tempo reale le operazioni della Coscienza.</li>
              </ul>
              <p className="mt-3 text-[11px] text-white/50">
                UX in stile banca: prima facciamo la pipeline corretta (TA + firma + relayer), poi rifiniamo UI/QR/copy.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===== Deposit Modal ===== */}
        {isDepositOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Deposita (USDC • Arbitrum)</h3>
                <button
                  className="text-xs text-white/70 hover:text-white"
                  onClick={() => setIsDepositOpen(false)}
                >
                  Chiudi
                </button>
              </div>

              <p className="mt-3 text-sm text-white/80">
                Invia <b>USDC (Arbitrum One)</b> a questo indirizzo (Trading Account):
              </p>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="text-[11px] text-white/60 mb-1">Trading Account</div>
                <div className="font-mono text-xs break-all">{tradingAddress || '—'}</div>
              </div>

              <p className="mt-3 text-[11px] text-white/60">
                Nota: invia solo USDC su Arbitrum One. (Poi aggiungiamo QR + copy migliore.)
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-600"
                  onClick={() => setIsDepositOpen(false)}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Withdraw Modal ===== */}
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Prelievo (USDC • Arbitrum)</h3>
                <button
                  className="text-xs text-white/70 hover:text-white"
                  onClick={() => setIsWithdrawOpen(false)}
                >
                  Chiudi
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                <input
                  className="w-full rounded-lg px-3 py-2 text-black"
                  placeholder="Indirizzo destinatario (0x...)"
                  value={withdrawTo}
                  onChange={(e) => setWithdrawTo(e.target.value)}
                />
                <input
                  className="w-full rounded-lg px-3 py-2 text-black"
                  placeholder="Importo USDC (es: 50.00)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="px-4 py-2 rounded-lg bg-cyan-600 disabled:opacity-60"
                >
                  {isWithdrawing ? 'Invio...' : 'Firma & Preleva'}
                </button>
              </div>

              {withdrawStatus && (
                <div className="mt-3 text-xs text-white/85 whitespace-pre-wrap">{withdrawStatus}</div>
              )}
              {withdrawTxHash && (
                <div className="mt-2 text-[11px] text-white/70 font-mono break-all">tx: {withdrawTxHash}</div>
              )}

              <p className="mt-4 text-[11px] text-white/55">
                Questo flusso è “bank-grade”: l’utente firma con Magic, il relayer paga gas, e i fondi escono dal Trading Account.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
