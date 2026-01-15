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

const GNS_ABI = ['function getTradingDelegate(address trader) view returns (address)'];

const TA_SETUP_ABI = [
  'function setTradingDelegateWithSig(address delegate,uint256 deadline,bytes sig) external',
];

const TA_ABI = ['function owner() view returns (address)', 'function nonces(address) view returns (uint256)'];

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

  if (typeof window !== 'undefined') {
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

/* --------------------------- UI HELPERS (Luminous) --------------------------- */

function Card({
  children,
  className = '',
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

function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'ok' | 'warn';
}) {
  const cls =
    tone === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warn'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-slate-200 bg-white/70 text-slate-600';

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:translate-y-[-1px] hover:brightness-110 disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
      style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)' }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <input
      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
      placeholder={placeholder}
      value={value}
      type={type}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      spellCheck={false}
    />
  );
}

/* ------------------------------ PAGE ------------------------------ */

export default function DashboardV2Page() {
  // === Session helpers (NO token globale) ===
  function getSessionToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cerbero_session');
  }

  function authHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cerbero_session') : null;
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('cerbero_session') : null;
        if (!token) return;

        const res = await fetch('/api/coordinator/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!data?.ok) return;

        if (typeof data.balanceUSDC === 'number') setBalanceUSDC(data.balanceUSDC);
        if (typeof data.tradingAddress === 'string') setTradingAddress(data.tradingAddress);

        const autopilot =
          typeof data.autopilotEnabled === 'boolean'
            ? data.autopilotEnabled
            : typeof data.autopilot_enabled === 'boolean'
            ? data.autopilot_enabled
            : null;

        if (autopilot !== null) setIsAutotradingOn(autopilot);
      } catch (err) {
        console.error('[dashboard] loadSummary error:', err);
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
      icon: intent === 'DEPOSIT' ? '⬆️' : intent === 'WITHDRAW' ? '⬇️' : m.isPositive ? '🟢' : '🔴',
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

  const autopilotActive = channel === 'defi' ? isAutotradingOn : isAutotradingCefiOn;

  const kpi = [
    {
      label: 'Saldo',
      value: channel === 'defi' ? `${displayBalanceUSDC} USDC` : `${formatNumber(cefiBalanceEur, 2)} €`,
      sub: channel === 'defi' ? `≈ € ${displayBalanceEUR}` : 'Broker balance',
      accent: 'from-indigo-500 to-purple-500',
    },
    {
      label: 'PnL Oggi',
      value: pnlTodayPct === null ? '—' : `${formatNumber(pnlTodayPct, 2)}%`,
      sub: 'dato da /movements',
      accent: 'from-cyan-500 to-indigo-500',
    },
    {
      label: 'PnL Mese',
      value: pnlMonthPct === null ? '—' : `${formatNumber(pnlMonthPct, 2)}%`,
      sub: 'dato da /movements',
      accent: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
    {/* Luminous / Aurora background */}
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />

      {/* primary blobs (match CTA gradient) */}
      <div className="absolute -top-44 -left-44 h-[620px] w-[620px] rounded-full bg-indigo-300/55 blur-[110px] mix-blend-multiply" />
      <div className="absolute top-1/4 -right-52 h-[680px] w-[680px] rounded-full bg-fuchsia-300/40 blur-[120px] mix-blend-multiply" />
      <div className="absolute bottom-[-260px] left-1/3 h-[760px] w-[760px] rounded-full bg-sky-300/40 blur-[130px] mix-blend-multiply" />

      {/* subtle highlight streak (adds “sheen” like the buttons) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_55%)]" />

      {/* light vignette for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_20%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_62%,rgba(255,255,255,0.85)_100%)]" />
    </div>

    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:px-6 lg:py-14">
        {/* Top bar */}
        <motion.section
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div
                className="absolute inset-0 rounded-2xl opacity-90 shadow-lg"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
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
                Cerbero Dashboard
              </span>
              <span className="text-sm font-semibold text-slate-800">
                La tua{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Coscienza Finanziaria
                </span>{' '}
                in tempo reale.
              </span>
              <span className="mt-1 text-[12px] text-slate-500">
                Wallet: <span className="font-mono text-slate-700">{formatAddress(userWallet)}</span>
                {userEmail ? (
                  <>
                    {' '}
                    · <span className="text-slate-500">Email:</span> {userEmail}
                  </>
                ) : null}
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
            <Pill tone={autopilotActive ? 'ok' : 'warn'}>
              {autopilotActive ? 'Autopilot attivo' : 'Autopilot disattivato'}
            </Pill>
            <Pill>Arbitrum One · USDC</Pill>
            <Link
              href="/account"
              className="ml-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
            >
              Account
            </Link>
          </motion.div>
        </motion.section>

        {/* Channel selector */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex justify-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm backdrop-blur-xl">
            <button
              onClick={() => setChannel('defi')}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                channel === 'defi'
                  ? 'text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={
                channel === 'defi'
                  ? { backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)' }
                  : {}
              }
            >
              Conto DeFi
            </button>
            <button
              onClick={() => setChannel('cefi')}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                channel === 'cefi'
                  ? 'text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={
                channel === 'cefi'
                  ? { backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)' }
                  : {}
              }
            >
              Broker MT5
            </button>
          </div>
        </motion.div>

        {/* KPI Row */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="grid gap-4 lg:grid-cols-3">
          {kpi.map((k) => (
            <Card key={k.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    {k.label}
                  </div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                    <span className={`bg-gradient-to-r ${k.accent} bg-clip-text text-transparent`}>
                      {k.value}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-slate-500">{k.sub}</div>
                </div>
                <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${k.accent} opacity-20`} />
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Main grid */}
        <section className="grid gap-6">
          {/* LEFT: Account / Controls */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              {channel === 'defi' ? (
                <>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]" />
                        Canale DeFi
                      </div>
                      <h2 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">
                        Conto DeFi — Arbitrum One
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Non-custodial · Smart Contract personale
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Pill tone={defiStatus.ok ? 'ok' : 'warn'}>
                        Stato: {defiStatus.label}
                      </Pill>
                      <Pill>
                        Conto: <span className="ml-1 font-mono">{formatAddress(tradingAddress)}</span>
                      </Pill>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {/* Balance card */}
                    <Card className="p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Saldo DeFi
                      </div>
                      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {displayBalanceUSDC} USDC
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">≈ € {displayBalanceEUR}</div>

                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            defiStatus.ok ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span className="text-sm font-semibold text-slate-700">{defiStatus.reason}</span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <SecondaryButton onClick={() => setIsDepositOpen(true)}>
                          Deposita
                        </SecondaryButton>
                        <PrimaryButton onClick={() => setIsWithdrawOpen(true)}>
                          Preleva
                        </PrimaryButton>
                      </div>

                      <p className="mt-3 text-[12px] font-semibold text-slate-500">
                        Il capitale resta nel tuo smart contract. Cerbero non custodisce fondi.
                      </p>
                    </Card>

                    {/* Autopilot + Setup */}
                    <Card className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            Esecuzione automatizzata
                          </div>
                          <div className="mt-2 text-base font-extrabold text-slate-900">
                            {isAutotradingOn ? 'Attiva' : 'Disattivata'}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-600">
                            Toggle via Coordinator (autopilot).
                          </div>
                          {autotradingMessage && (
                            <div className="mt-2 text-[12px] font-semibold text-amber-700">
                              {autotradingMessage}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleToggleAutotrading}
                          disabled={isTogglingAutotrading}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full border transition ${
                            isAutotradingOn
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-slate-200 bg-white/70'
                          }`}
                        >
                          <span
                            className={`ml-1 h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-slate-200 transition-transform ${
                              isAutotradingOn ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                      <div className="mt-5">
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Setup esecuzione (una tantum)
                        </div>

                        <div className="mt-2 flex flex-col gap-2">
                          <div className="text-sm font-semibold text-slate-700">
                            Delegate:{' '}
                            <span className="font-mono text-slate-600">
                              {formatAddress(delegateAddress)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Pill tone={defiExecutionEnabled ? 'ok' : 'warn'}>
                              {defiExecutionEnabled ? 'Esecuzione abilitata' : 'Esecuzione non abilitata'}
                            </Pill>

                            <SecondaryButton
                              onClick={handleOneTimeDelegateSetup}
                              disabled={isSettingDelegate || !tradingAddress}
                              className="ml-auto"
                            >
                              {defiExecutionEnabled ? 'OK' : isSettingDelegate ? 'In corso…' : 'Abilita'}
                            </SecondaryButton>
                          </div>

                          {delegateStatus && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-semibold text-amber-800 whitespace-pre-wrap">
                              {delegateStatus}
                            </div>
                          )}
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-200 bg-white/70 p-4">
                          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            Checklist
                          </div>
                          <ul className="mt-2 space-y-2 text-sm font-semibold text-slate-700">
                            <li className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${defiHasBalance ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span>{defiHasBalance ? 'Deposito completato' : 'Deposita USDC'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${defiExecutionEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span>{defiExecutionEnabled ? 'Esecuzione abilitata' : 'Abilita esecuzione (una tantum)'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${isAutotradingOn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span>{isAutotradingOn ? 'Autopilot attivo' : 'Attiva autopilot'}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.45)]" />
                        Canale CeFi
                      </div>
                      <h2 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">Broker MT5</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Connessione via API (MetaApi) · Fondi sul broker
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Pill tone={cefiStatus.ok ? 'ok' : 'warn'}>
                        Stato: {cefiStatus.label}
                      </Pill>
                      <Pill tone={cefiConnected ? 'ok' : 'warn'}>
                        {cefiConnected ? 'Broker collegato' : 'Broker non collegato'}
                      </Pill>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <Card className="p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Saldo CeFi</div>
                      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {formatNumber(cefiBalanceEur, 2)} €
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">Broker balance</div>

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            Esecuzione automatizzata
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-700">
                            {isAutotradingCefiOn ? 'Attiva' : 'Disattivata'}
                          </div>
                          <div className="mt-1 text-[12px] font-semibold text-slate-500">
                            (si attiva dopo connessione broker + backend CeFi)
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAutotradingCefiOn((v) => !v)}
                          disabled={!cefiConnected}
                          title={!cefiConnected ? 'Collega prima un broker' : ''}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full border transition ${
                            isAutotradingCefiOn
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-slate-200 bg-white/70'
                          } ${!cefiConnected ? 'opacity-60' : ''}`}
                        >
                          <span
                            className={`ml-1 h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-slate-200 transition-transform ${
                              isAutotradingCefiOn ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4">
                        <PrimaryButton onClick={() => setIsConnectBrokerOpen(true)} className="w-full">
                          {cefiConnected ? 'Gestisci Broker' : 'Connetti Broker'}
                        </PrimaryButton>
                      </div>

                      <p className="mt-3 text-[12px] font-semibold text-slate-500">
                        Nota: Cerbero non custodisce fondi. Il capitale resta sul broker.
                      </p>
                    </Card>

                    <Card className="p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Checklist</div>
                      <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
                        <li className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${cefiConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span>{cefiConnected ? 'Broker connesso' : 'Connetti broker MT5'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${isAutotradingCefiOn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span>{isAutotradingCefiOn ? 'Autopilot attivo' : 'Attiva autopilot (quando disponibile)'}</span>
                        </li>
                      </ul>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Stato canale
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${cefiStatus.ok ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          <span className="text-sm font-semibold text-slate-700">{cefiStatus.label}</span>
                        </div>
                        <div className="mt-1 text-[12px] font-semibold text-slate-500">{cefiStatus.reason}</div>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          {/* RIGHT: Activity */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Activity Log
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    {isLoadingMovements ? 'Loading…' : 'Live'} ·{' '}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {channel === 'defi' ? 'DEFI' : 'CEFI'}
                    </span>
                  </div>
                </div>

                <Pill>{hasRealTx ? `${activityItems.length} eventi` : 'Nessun evento'}</Pill>
              </div>

              <div className="mt-4 relative h-[380px] lg:h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white/70">
                {/* subtle top bar */}
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />

                {channel === 'defi' ? (
                  !hasRealTx || activityItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-6">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15" />
                      <p className="text-sm font-semibold text-slate-700">Nessun evento registrato</p>
                      <p className="text-[12px] font-semibold text-slate-500">
                        Inizia da qui: Deposita → Abilita esecuzione (una tantum) → Attiva autopilot.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      className="absolute inset-0 px-3 py-3"
                      animate={{ y: ['0%', '-50%'] }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="flex flex-col gap-2">
                        {[...activityItems, ...activityItems].map((item, idx) => {
                          const intentTone =
                            item.intent === 'WITHDRAW'
                              ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                              : item.intent === 'DEPOSIT'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : item.intent === 'TRADE'
                              ? item.isPositive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-rose-200 bg-rose-50 text-rose-800'
                              : 'border-slate-200 bg-white text-slate-700';

                          return (
                            <div
                              key={`${item.symbol}-${item.time}-${idx}`}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/85 px-3 py-2 shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                                  <span className="text-base">{item.icon}</span>
                                </div>

                                <div className="flex flex-col">
                                  <div className="text-[12px] font-extrabold tracking-tight text-slate-900">
                                    {item.type.toUpperCase()}
                                  </div>
                                  <div className="text-[12px] font-semibold text-slate-600">
                                    {item.symbol} · {item.action}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${intentTone}`}>
                                  {item.value}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">{item.time}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-6">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15" />
                    <p className="text-sm font-semibold text-slate-700">Nessun evento CeFi</p>
                    <p className="text-[12px] font-semibold text-slate-500">
                      Inizia da qui: Connetti broker → (poi) Attiva autopilot.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-[12px] font-semibold text-slate-500">
                Tip: per DeFi gli eventi appaiono dopo movimenti reali (tx hash on-chain).
              </div>
            </Card>
          </motion.div>
        </section>

        {/* ===================== MODALS (LUMINOUS) ===================== */}

        {/* Deposit Modal */}
        {isDepositOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Deposito</div>
                  <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                    USDC · Arbitrum One
                  </h3>
                </div>
                <SecondaryButton onClick={() => setIsDepositOpen(false)}>Chiudi</SecondaryButton>
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-600">
                Invia <span className="text-slate-900">USDC (Arbitrum One)</span> a questo indirizzo (Conto DeFi):
              </p>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 mb-2">
                  Conto DeFi
                </div>
                <div className="font-mono text-sm break-all text-slate-800">{tradingAddress || '—'}</div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-semibold text-amber-800">
                Nota: invia solo USDC su Arbitrum One.
              </div>

              <div className="mt-5 flex justify-end">
                <PrimaryButton onClick={() => setIsDepositOpen(false)}>Ok</PrimaryButton>
              </div>
            </Card>
          </div>
        )}

        {/* Withdraw Modal */}
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Prelievo</div>
                  <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                    USDC · Arbitrum One
                  </h3>
                </div>
                <SecondaryButton onClick={() => setIsWithdrawOpen(false)}>Chiudi</SecondaryButton>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="grid gap-2">
                  <label className="text-[12px] font-semibold text-slate-600">Indirizzo destinatario</label>
                  <TextInput value={withdrawTo} onChange={setWithdrawTo} placeholder="0x..." />
                </div>

                <div className="grid gap-2">
                  <label className="text-[12px] font-semibold text-slate-600">Importo USDC</label>
                  <TextInput value={withdrawAmount} onChange={setWithdrawAmount} placeholder="es: 50.00" inputMode="decimal" />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <PrimaryButton onClick={handleWithdraw} disabled={isWithdrawing}>
                  {isWithdrawing ? 'Invio…' : 'Firma & Preleva'}
                </PrimaryButton>

                <SecondaryButton onClick={() => setIsWithdrawOpen(false)}>Annulla</SecondaryButton>
              </div>

              {withdrawStatus && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4 text-[12px] font-semibold text-slate-700 whitespace-pre-wrap">
                  {withdrawStatus}
                </div>
              )}

              {withdrawTxHash && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white/70 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Tx Hash</div>
                  <div className="mt-2 break-all font-mono text-[12px] text-slate-700">{withdrawTxHash}</div>
                </div>
              )}

              <p className="mt-5 text-[12px] font-semibold text-slate-500">
                Flusso bank-grade: firma Magic → relayer paga gas → fondi escono dal Conto DeFi.
              </p>
            </Card>
          </div>
        )}

        {/* Connect Broker Modal (placeholder) */}
        {isConnectBrokerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Connessione</div>
                  <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">Broker MT5</h3>
                </div>
                <SecondaryButton onClick={() => setIsConnectBrokerOpen(false)}>Chiudi</SecondaryButton>
              </div>

              <p className="mt-4 text-[13px] font-semibold text-slate-600">
                Inserisci le credenziali del tuo conto MT5. Cerbero userà MetaApi lato backend per eseguire ordini.
              </p>

              <div className="mt-5 grid gap-3">
                <TextInput value={brokerName} onChange={setBrokerName} placeholder="Broker (es: IC Markets, Pepperstone…)" />
                <TextInput value={brokerLogin} onChange={setBrokerLogin} placeholder="Login MT5" />
                <TextInput value={brokerPassword} onChange={setBrokerPassword} placeholder="Password MT5" type="password" />
                <TextInput value={brokerServer} onChange={setBrokerServer} placeholder="Server (opzionale)" />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <PrimaryButton onClick={handleConnectBroker} disabled={isConnectingBroker}>
                  {isConnectingBroker ? 'Connessione…' : 'Connetti'}
                </PrimaryButton>
                <SecondaryButton onClick={() => setIsConnectBrokerOpen(false)}>Annulla</SecondaryButton>
              </div>

              {brokerStatus && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4 text-[12px] font-semibold text-slate-700 whitespace-pre-wrap">
                  {brokerStatus}
                </div>
              )}

              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-semibold text-amber-800">
                Nota: in questa fase è placeholder UI. Il backend CeFi reale verrà collegato quando sarà pronto.
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
