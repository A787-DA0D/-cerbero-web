'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Magic } from 'magic-sdk';
import { BrowserProvider, Contract, parseUnits } from 'ethers';

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
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

const GNS_DIAMOND = '0xFF162c694eAA571f685030649814282eA457f169';
const EXECUTOR = '0x7C0cf0540B053DB33840Ccb42e24b2cD02794121';

const GNS_ABI = [
  'function getTradingDelegate(address trader) view returns (address)',
];

const TA_SETUP_ABI = [
  'function setTradingDelegateWithSig(address delegate,uint256 deadline,bytes sig) external',
];

const TA_ABI = [
  'function owner() view returns (address)',
  'function nonces(address) view returns (uint256)',
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
  const m = new Magic(key, { network: { rpcUrl, chainId: CHAIN_ID } });

  if (typeof window !== "undefined") {
    (window as any).cerberoMagic = m;
    (window as any).cerberoProvider = m.rpcProvider;
  }

  return m;
}

function getChannelStatus(args: {
  hasBalance: boolean;
  executionEnabled: boolean; // DeFi delegate OK o CeFi broker connesso
  autopilotOn: boolean;
}) {
  const { hasBalance, executionEnabled, autopilotOn } = args;

  if (!hasBalance) {
    return { label: 'Non operativo', reason: 'Manca: saldo / capitale', ok: false };
  }
  if (!executionEnabled) {
    return { label: 'Parzialmente operativo', reason: 'Manca: abilitazione canale', ok: false };
  }
  if (!autopilotOn) {
    return { label: 'Pronto', reason: 'Esecuzione automatizzata disattivata', ok: true };
  }
  return { label: 'Operativo', reason: 'Sistema attivo', ok: true };
}

export default function DashboardV2Page() {
  // === Session helpers (NO token globale) ===
  function getSessionToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cerbero_session');
  }

  function authHeaders(): HeadersInit {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('cerbero_session')
        : null;

    const h: Record<string, string> = {};
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  // ======================
  // STATE SESSIONE & DATI
  // ======================
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null); // EOA Magic (identità)
  const [tradingAddress, setTradingAddress] = useState<string | null>(null); // TA (fondi)

  const [balanceUSDC, setBalanceUSDC] = useState<number | null>(null);
  const [pnlTodayPct, setPnlTodayPct] = useState<number | null>(null);
  const [pnlMonthPct, setPnlMonthPct] = useState<number | null>(null);

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  // Autotrading DeFi (coordinator)
  const [isAutotradingOn, setIsAutotradingOn] = useState<boolean>(false);
  const [isTogglingAutotrading, setIsTogglingAutotrading] = useState(false);
  const [autotradingMessage, setAutotradingMessage] = useState<string | null>(null);

  // Deposito tutorial modal
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // Withdraw UI
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawTo, setWithdrawTo] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // One-time setup: GNS delegate
  const [delegateStatus, setDelegateStatus] = useState<string | null>(null);
  const [isSettingDelegate, setIsSettingDelegate] = useState(false);
  const [delegateAddress, setDelegateAddress] = useState<string | null>(null);

  // UI: canale selezionato
  const [channel, setChannel] = useState<'defi' | 'cefi'>('defi');

  // CeFi placeholders (backend arriverà con chat CeFi)
  const [cefiConnected, setCefiConnected] = useState(false);
  const [cefiBalanceEur, setCefiBalanceEur] = useState<number>(0);
  const [isAutotradingCefiOn, setIsAutotradingCefiOn] = useState(false);

  const [isConnectBrokerOpen, setIsConnectBrokerOpen] = useState(false);
  const [brokerName, setBrokerName] = useState('');
  const [brokerLogin, setBrokerLogin] = useState('');
  const [brokerPassword, setBrokerPassword] = useState('');
  const [brokerServer, setBrokerServer] = useState('');
  const [brokerStatus, setBrokerStatus] = useState<string | null>(null);
  const [isConnectingBroker, setIsConnectingBroker] = useState(false);

  // ======================
  // EFFECT: /api/me
  // ======================
  useEffect(() => {
    const loadMe = async () => {
      const token = getSessionToken();
      if (!token) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('/api/me', { method: 'GET', headers: { ...authHeaders() } });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) throw new Error('invalid session');

        setUserEmail(data.email ?? null);
        setUserWallet(data.wallet ?? null);
        if (data.tradingAddress) setTradingAddress(data.tradingAddress);
      } catch (err) {
        console.error('[dashboard] /api/me error:', err);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cerbero_session');
          window.location.href = '/login';
        }
      }
    };

    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================
  // EFFECT: /api/coordinator/balance (saldo + trading addr + autopilot)
  // ======================
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("cerbero_session")
            : null;

        if (!token) return;

        const res = await fetch("/api/coordinator/balance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!data?.ok) return;

        if (typeof data.balanceUSDC === "number") setBalanceUSDC(data.balanceUSDC);
        if (typeof data.tradingAddress === "string") setTradingAddress(data.tradingAddress);

        const autopilot =
          typeof data.autopilotEnabled === "boolean"
            ? data.autopilotEnabled
            : typeof data.autopilot_enabled === "boolean"
            ? data.autopilot_enabled
            : null;

        if (autopilot !== null) setIsAutotradingOn(autopilot);

      } catch (err) {
        console.error("[dashboard] loadSummary error:", err);
      }
    };

    loadSummary();
  }, []);

  useEffect(() => {
    if (!tradingAddress) return;
    refreshDelegateStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradingAddress]);

  // ======================
  // EFFECT: /api/tenant/movements (AUTH)
  // ======================
  useEffect(() => {
    const loadMovements = async () => {
      if (!userEmail && !userWallet) return;

      setIsLoadingMovements(true);

      try {
        const res = await fetch('/api/tenant/movements', {
          method: 'GET',
          headers: { ...authHeaders() },
        });

        if (!res.ok) return;

        const data = await res.json().catch(() => null);
        if (!data?.ok) return;

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

          const raw = Number(m.amountUSDC ?? m.rawAmount ?? 0);
          const isPositive = raw >= 0;

          return {
            id: m.id,
            date: dateStr,
            type: m.labelType || m.label || m.type || 'Movimento',
            detail: m.detail || m.metadata?.detail || 'Movimento saldo',
            chain: m.chain === 'arbitrum_one' ? 'Arbitrum' : m.chain || 'Arbitrum',
            amount: m.amount || `${raw.toFixed(2)} USDC`,
            isPositive,
            txHash: m.txHash ?? m.tx_hash ?? null,
            source: m.source ?? null,
          };
        });

        setMovements(rows);

        if (data.tradingAddress) setTradingAddress(data.tradingAddress);
        if (typeof data.balanceUSDC === 'number') setBalanceUSDC(data.balanceUSDC);
        if (typeof data.autotradingEnabled === 'boolean') setIsAutotradingOn(data.autotradingEnabled);
        if (typeof data.pnlTodayPct === 'number') setPnlTodayPct(data.pnlTodayPct);
        if (typeof data.pnlMonthPct === 'number') setPnlMonthPct(data.pnlMonthPct);
      } catch (err) {
        console.error('[/api/tenant/movements] errore fetch:', err);
      } finally {
        setIsLoadingMovements(false);
      }
    };

    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userWallet]);

  const refreshDelegateStatus = async () => {
    try {
      if (!tradingAddress) return;
      const magic = getMagicArbitrum();
      const provider = new BrowserProvider(magic.rpcProvider as any);
      const gns = new Contract(GNS_DIAMOND, GNS_ABI, provider);
      const d: string = await gns.getTradingDelegate(tradingAddress);
      setDelegateAddress(d);
    } catch (e: any) {
      console.error('[delegate] refresh error', e);
    }
  };

  // ======================
  // Autotrading (DeFi) toggle handler
  // ======================
  const handleToggleAutotrading = async () => {
    if (isTogglingAutotrading) return;

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
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, enabled: nextValue }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setAutotradingMessage('Non riesco a cambiare lo stato ora. Riprova tra qualche istante.');
        return;
      }

      setIsAutotradingOn(Boolean(data.autopilot_enabled));
    } catch (err) {
      setAutotradingMessage('Errore di connessione. Controlla la rete e riprova.');
    } finally {
      setIsTogglingAutotrading(false);
    }
  };

  // ======================
  // Withdraw: Magic + EIP-712 + /api/withdraw
  // ======================
  const handleWithdraw = async () => {
    try {
      setWithdrawStatus(null);
      setWithdrawTxHash(null);

      if (!tradingAddress) {
        setWithdrawStatus('Conto DeFi non disponibile. Riprova tra poco.');
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
      setWithdrawStatus('Firma in corso...');

      const magic = getMagicArbitrum();
      const provider = new BrowserProvider(magic.rpcProvider as any);
      const signer = await provider.getSigner();

      const ownerAddr = await signer.getAddress();

      const ta = new Contract(tradingAddress, TA_ABI, provider);
      const nonce: bigint = await ta.getFunction('nonces').staticCall(ownerAddr);

      const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 min

      const domain = {
        name: 'CerberoTradingAccount',
        version: '3',
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

      const resp = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { ...authHeaders(), 'content-type': 'application/json' },
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

      setWithdrawTxHash(data.txHash || null);
      setWithdrawStatus('✅ Prelievo inviato correttamente.');
      setWithdrawAmount('');
    } catch (e: any) {
      setWithdrawStatus(e?.message || 'Errore inatteso.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ======================
  // One-time setup: delegate
  // ======================
  const handleOneTimeDelegateSetup = async () => {
    try {
      setDelegateStatus(null);

      if (!tradingAddress) {
        setDelegateStatus('Conto DeFi non disponibile. Riprova tra poco.');
        return;
      }

      setIsSettingDelegate(true);
      setDelegateStatus('Controllo permessi su GNS...');

      const magic = getMagicArbitrum();
      const provider = new BrowserProvider(magic.rpcProvider as any);
      const signer = await provider.getSigner();

      const gns = new Contract(GNS_DIAMOND, GNS_ABI, provider);
      const current: string = await gns.getTradingDelegate(tradingAddress);

      setDelegateAddress(current);
      if (current && current.toLowerCase() === EXECUTOR.toLowerCase()) {
        setDelegateStatus('✅ Esecuzione già abilitata (delegate ok).');
        return;
      }

      setDelegateStatus('Firma richiesta: abilita esecuzione (una tantum)…');

      const taRead = new Contract(tradingAddress, TA_ABI, provider);
      const ownerAddr = await signer.getAddress();
      const nonce: bigint = await taRead.getFunction('nonces').staticCall(ownerAddr);
      const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 min

      const domain = {
        name: 'CerberoTradingAccount',
        version: '3',
        chainId: CHAIN_ID,
        verifyingContract: tradingAddress,
      };

      const types = {
        SetDelegate: [
          { name: 'delegate', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message = {
        delegate: EXECUTOR,
        nonce: nonce.toString(),
        deadline,
      };

      const sig = await signer.signTypedData(domain as any, types as any, message as any);

      const ta = new Contract(tradingAddress, TA_SETUP_ABI, signer);
      const tx = await ta.setTradingDelegateWithSig(EXECUTOR, BigInt(deadline), sig);

      setDelegateStatus('Tx inviata: ' + tx.hash + '. Attendo conferma...');
      await tx.wait();

      setDelegateStatus('✅ Abilitazione completata.');
      await refreshDelegateStatus();
    } catch (e: any) {
      console.error('[delegate] setup error', e);
      setDelegateStatus(e?.message || 'Errore inatteso durante il setup.');
    } finally {
      setIsSettingDelegate(false);
    }
  };

  // ======================
  // CeFi connect placeholder (backend verrà dopo)
  // ======================
  const handleConnectBroker = async () => {
    setBrokerStatus(null);

    if (!brokerLogin || !brokerPassword) {
      setBrokerStatus('Inserisci login e password del conto MT5.');
      return;
    }

    setIsConnectingBroker(true);
    try {
      // Placeholder: quando la chat CeFi crea API vere, sostituiamo endpoint.
      // Per ora simuliamo connessione corretta.
      await new Promise((r) => setTimeout(r, 600));
      setCefiConnected(true);
      setBrokerStatus('✅ Broker collegato (placeholder).');
      setIsConnectBrokerOpen(false);
    } catch (e: any) {
      setBrokerStatus(e?.message || 'Errore connessione broker.');
    } finally {
      setIsConnectingBroker(false);
    }
  };

  // ======================
  // Activity feed: SOLO dati reali (movements)
  // ======================
  const hasRealTx = movements.some((m) => {
    const h = (m.txHash || '').toString();
    return h.startsWith('0x') && h.length >= 20;
  });

  const realMovements = movements.filter((m) => {
    const h = (m.txHash || '').toString();
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

  const displayBalanceUSDC = balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : '—';
  const displayBalanceEUR = balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : '—';

  const defiExecutionEnabled = useMemo(() => {
    if (!delegateAddress) return false;
    return delegateAddress.toLowerCase() === EXECUTOR.toLowerCase();
  }, [delegateAddress]);

  const defiHasBalance = (balanceUSDC ?? 0) > 0;

  const defiStatus = getChannelStatus({
    hasBalance: defiHasBalance,
    executionEnabled: defiExecutionEnabled,
    autopilotOn: isAutotradingOn,
  });

  const cefiStatus = getChannelStatus({
    hasBalance: (cefiBalanceEur ?? 0) > 0 || cefiConnected,
    executionEnabled: cefiConnected,
    autopilotOn: isAutotradingCefiOn,
  });

  const activeBadge = channel === 'defi' ? 'DEFI' : 'CEFI';

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-fuchsia-600/35 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full bg-violet-500/25 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-7 px-4 py-10 lg:px-6 lg:py-14">
        {/* Header */}
        <motion.section
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
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
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Cerbero Dashboard</span>
              <span className="text-sm font-semibold">
                La tua{' '}
                <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                  Coscienza Finanziaria
                </span>{' '}
                in tempo reale.
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 text-[11px] text-white/60">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Data driven since 2020</span>
            <span
              className={`rounded-full border px-3 py-1 ${
                (channel === 'defi' ? isAutotradingOn : isAutotradingCefiOn)
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
              }`}
            >
              {(channel === 'defi' ? isAutotradingOn : isAutotradingCefiOn)
                ? 'Esecuzione automatizzata attiva'
                : 'Esecuzione automatizzata disattivata'}
            </span>
            <Link
              href="/account"
              className="ml-auto rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white hover:bg-white/15"
            >
              Account
            </Link>
          </motion.div>
        </motion.section>

        {/* Channel selector */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
            <button
              onClick={() => setChannel('defi')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                channel === 'defi'
                  ? 'bg-white/10 text-white shadow-[0_0_24px_rgba(0,240,255,0.18)]'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Conto DeFi
            </button>
            <button
              onClick={() => setChannel('cefi')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                channel === 'cefi'
                  ? 'bg-white/10 text-white shadow-[0_0_24px_rgba(188,19,254,0.18)]'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Broker MT5
            </button>
          </div>
        </motion.div>

        {/* GRID */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* LEFT */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/75 via-slate-950 to-black/90 p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.6)]"
          >
            {channel === 'defi' ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Canale DeFi</p>
                    <h2 className="mt-1 text-base font-semibold text-white/90">
                      Conto DeFi — Arbitrum One
                    </h2>
                    <p className="mt-1 text-xs text-white/55">
                      Non-custodial • Smart Contract personale
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] text-white/60">
                    On-chain
                  </span>
                </div>

                {/* Balance */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs text-white/60">Saldo</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                      {displayBalanceUSDC} USDC
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] text-white/55">≈ € {displayBalanceEUR}</p>
                  <p className="mt-2 text-[11px] text-white/55">
                    Conto: <span className="font-mono text-white/75">{formatAddress(tradingAddress)}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 rounded-full ${defiStatus.ok ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                    <span className="font-medium text-white/85">Stato canale: {defiStatus.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">{defiStatus.reason}</p>
                </div>

                {/* Autopilot */}
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/45 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-white/60">Esecuzione automatizzata</span>
                    <span className={`text-sm font-semibold ${isAutotradingOn ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {isAutotradingOn ? 'Attiva' : 'Disattivata'}
                    </span>
                    {autotradingMessage && <span className="mt-1 text-[11px] text-amber-300">{autotradingMessage}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutotrading}
                    className="relative inline-flex h-7 w-12 items-center rounded-full border border-white/20 bg-white/5 px-1 transition"
                    disabled={isTogglingAutotrading}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white shadow-[0_0_12px_rgba(16,185,129,0.9)] transition-transform ${
                        isAutotradingOn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDepositOpen(true)}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition hover:border-emerald-300 hover:bg-emerald-500/25"
                  >
                    Deposita
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(true)}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-gradient-to-r from-sky-500/15 via-blue-500/20 to-fuchsia-500/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
                  >
                    Preleva
                  </button>
                </div>

                {/* One-time setup */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/60">Setup esecuzione (una tantum)</span>
                      <span className="text-sm font-semibold text-white/85">
                        {defiExecutionEnabled ? 'Esecuzione abilitata' : 'Esecuzione non abilitata'}
                      </span>
                      <span className="mt-1 text-[11px] text-white/55">
                        Dettagli tecnici: delegate{' '}
                        <span className="font-mono text-white/70">{formatAddress(delegateAddress)}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleOneTimeDelegateSetup}
                      disabled={isSettingDelegate || !tradingAddress}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                    >
                      {defiExecutionEnabled ? 'OK' : isSettingDelegate ? 'In corso…' : 'Abilita'}
                    </button>
                  </div>

                  {delegateStatus && (
                    <p className="mt-2 text-[11px] text-amber-200 whitespace-pre-wrap">{delegateStatus}</p>
                  )}
                </div>

                {/* Passaggi */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">Passaggi</p>
                  <ul className="space-y-1 text-sm text-white/80">
                    <li className={`flex gap-2 ${defiHasBalance ? 'opacity-45' : ''}`}>
                      <span>{defiHasBalance ? '✓' : '•'}</span>
                      <span>Deposito</span>
                    </li>
                    <li className={`flex gap-2 ${defiExecutionEnabled ? 'opacity-45' : ''}`}>
                      <span>{defiExecutionEnabled ? '✓' : '•'}</span>
                      <span>Abilita esecuzione (una tantum)</span>
                    </li>
                    <li className={`flex gap-2 ${isAutotradingOn ? 'opacity-45' : ''}`}>
                      <span>{isAutotradingOn ? '✓' : '•'}</span>
                      <span>Esecuzione automatizzata</span>
                    </li>
                  </ul>
                </div>

                <p className="mt-3 text-[11px] text-white/45">
                  Nota: Cerbero non custodisce fondi. Il capitale resta nel tuo smart contract.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Canale CeFi</p>
                    <h2 className="mt-1 text-base font-semibold text-white/90">
                      Broker MT5
                    </h2>
                    <p className="mt-1 text-xs text-white/55">
                      Connessione tramite MetaApi • Fondi sul broker
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] text-white/60">
                    Off-chain
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs text-white/60">Saldo</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                      {formatNumber(cefiBalanceEur, 2)} €
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] text-white/55">≈ € {formatNumber(cefiBalanceEur, 2)}</p>
                  <p className="mt-2 text-[11px] text-white/55">
                    Stato: <span className="text-white/75">{cefiConnected ? 'Broker collegato' : 'Nessun broker collegato'}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 rounded-full ${cefiStatus.ok ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                    <span className="font-medium text-white/85">Stato canale: {cefiStatus.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">{cefiStatus.reason}</p>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/45 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-white/60">Esecuzione automatizzata</span>
                    <span className={`text-sm font-semibold ${isAutotradingCefiOn ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {isAutotradingCefiOn ? 'Attiva' : 'Disattivata'}
                    </span>
                    <span className="mt-1 text-[11px] text-white/55">
                      (Si attiva dopo connessione broker + backend CeFi)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutotradingCefiOn((v) => !v)}
                    className="relative inline-flex h-7 w-12 items-center rounded-full border border-white/20 bg-white/5 px-1 transition"
                    disabled={!cefiConnected}
                    title={!cefiConnected ? 'Collega prima un broker' : ''}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white shadow-[0_0_12px_rgba(16,185,129,0.9)] transition-transform ${
                        isAutotradingCefiOn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setIsConnectBrokerOpen(true)}
                    className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/15"
                  >
                    {cefiConnected ? 'Gestisci Broker' : 'Connetti Broker'}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">Passaggi</p>
                  <ul className="space-y-1 text-sm text-white/80">
                    <li className={`flex gap-2 ${cefiConnected ? 'opacity-45' : ''}`}>
                      <span>{cefiConnected ? '✓' : '•'}</span>
                      <span>Connetti broker MT5</span>
                    </li>
                    <li className={`flex gap-2 ${isAutotradingCefiOn ? 'opacity-45' : ''}`}>
                      <span>{isAutotradingCefiOn ? '✓' : '•'}</span>
                      <span>Esecuzione automatizzata</span>
                    </li>
                  </ul>
                </div>

                <p className="mt-3 text-[11px] text-white/45">
                  Nota: Cerbero non custodisce fondi. Il capitale resta sul broker.
                </p>
              </>
            )}
          </motion.div>

          {/* RIGHT */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-sky-500/10 p-4 backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between text-[11px] text-white/70">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
                Activity Log • {isLoadingMovements ? 'Loading…' : 'Live'}
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100/80">
                {activeBadge}
              </span>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-3">
              {channel === 'defi' ? (
                !hasRealTx || activityItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-white/50">
                    <span className="text-xl">◌</span>
                    <p>Nessun evento registrato</p>
                    <p className="text-xs text-white/40">
                      Inizia da qui: Deposita → Abilita esecuzione (una tantum) → Attiva esecuzione automatizzata.
                    </p>
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
                )
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-white/50">
                  <span className="text-xl">◌</span>
                  <p>Nessun evento CeFi</p>
                  <p className="text-xs text-white/40">
                    Inizia da qui: Connetti broker → (poi) Attiva esecuzione automatizzata.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* ===== Deposit Modal ===== */}
        {isDepositOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Deposito (USDC • Arbitrum)</h3>
                <button className="text-xs text-white/70 hover:text-white" onClick={() => setIsDepositOpen(false)}>
                  Chiudi
                </button>
              </div>

              <p className="mt-3 text-sm text-white/80">
                Invia <b>USDC (Arbitrum One)</b> a questo indirizzo (Conto DeFi):
              </p>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="text-[11px] text-white/60 mb-1">Conto DeFi</div>
                <div className="font-mono text-xs break-all">{tradingAddress || '—'}</div>
              </div>

              <p className="mt-3 text-[11px] text-white/60">Nota: invia solo USDC su Arbitrum One.</p>

              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 rounded-lg bg-emerald-600" onClick={() => setIsDepositOpen(false)}>
                  Ok
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Withdraw Modal ===== */}
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Prelievo (USDC • Arbitrum)
                </h3>
                <button
                  className="text-xs text-white/70 hover:text-white"
                  onClick={() => setIsWithdrawOpen(false)}
                >
                  Chiudi
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="grid gap-1">
                  <label className="text-[11px] text-white/70">
                    Indirizzo destinatario
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="0x..."
                    value={withdrawTo}
                    onChange={(e) => setWithdrawTo(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-[11px] text-white/70">
                    Importo USDC
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="es: 50.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 hover:bg-cyan-400"
                >
                  {isWithdrawing ? "Invio..." : "Firma & Preleva"}
                </button>

                <button
                  onClick={() => setIsWithdrawOpen(false)}
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Annulla
                </button>
              </div>

              {withdrawStatus && (
                <div className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/85">
                  {withdrawStatus}
                </div>
              )}

              {withdrawTxHash && (
                <div className="mt-2 break-all font-mono text-[11px] text-white/70">
                  tx: {withdrawTxHash}
                </div>
              )}

              <p className="mt-5 text-[11px] text-white/55">
                Flusso bank-grade: firma Magic → relayer paga gas → fondi escono dal Conto DeFi.
              </p>
            </div>
          </div>
        )}

        {/* ===== Connect Broker Modal (placeholder) ===== */}
        {isConnectBrokerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Connetti Broker MT5
                </h3>
                <button
                  className="text-xs text-white/70 hover:text-white"
                  onClick={() => setIsConnectBrokerOpen(false)}
                >
                  Chiudi
                </button>
              </div>

              <p className="mt-3 text-[12px] text-white/70">
                Inserisci le credenziali del tuo conto MT5. Cerbero userà MetaApi lato backend per eseguire ordini.
              </p>

              <div className="mt-4 grid gap-3">
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Broker (es: IC Markets, Pepperstone...)"
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                />
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Login MT5"
                  value={brokerLogin}
                  onChange={(e) => setBrokerLogin(e.target.value)}
                />
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Password MT5"
                  type="password"
                  value={brokerPassword}
                  onChange={(e) => setBrokerPassword(e.target.value)}
                />
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Server (opzionale)"
                  value={brokerServer}
                  onChange={(e) => setBrokerServer(e.target.value)}
                />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={handleConnectBroker}
                  disabled={isConnectingBroker}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 hover:bg-cyan-400"
                >
                  {isConnectingBroker ? "Connessione..." : "Connetti"}
                </button>

                <button
                  onClick={() => setIsConnectBrokerOpen(false)}
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Annulla
                </button>
              </div>

              {brokerStatus && (
                <div className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/85">
                  {brokerStatus}
                </div>
              )}

              <p className="mt-5 text-[11px] text-white/55">
                Nota: in questa fase è placeholder UI. Il backend CeFi reale verrà collegato quando sarà pronto.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
