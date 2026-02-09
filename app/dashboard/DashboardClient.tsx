'use client';



type TradeRow = {
  id?: string | null;
  ts?: string | null;
  created_at?: string | null;
  opened_at?: string | null;
  symbol?: string | null;
  side?: string | null;
  status?: string | null;
  size_usdc?: number | null;
  entry_price?: number | null;
  exit_price?: number | null;
  pnl_usdc?: number | null;
};

type TradesResponse = {
  ok: boolean;
  error?: string;
  trades?: TradeRow[];
};

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

type TabKey = 'overview' | 'trades' | 'activity' | 'profile';

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(' ');
}

function formatLastSync(ts?: string | null) {
  if (!ts) return '—';
  const d = new Date(ts);
  const ms = d.getTime();
  if (!isFinite(ms)) return '—';
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return 'adesso';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} min fa`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h fa`;
  const days = Math.floor(hrs / 24);
  return `${days} g fa`;
}


function formatTs(ts?: string | null) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(ts);
  }
}


function formatMoney(v?: number | null, currency: string = 'USD') {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (!isFinite(n)) return '—';
  try {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    // fallback se currency non valida o Intl fallisce
    return `${n.toFixed(2)} ${currency || 'USD'}`;
  }
}




function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-3xl border border-slate-200/70 bg-white/70 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl ring-1 ring-white/40',
        className
      )}
    >
      {children}
    </div>
  );
}

function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'ok' | 'warn';
}) {
  const cls =
    tone === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warn'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-slate-200/70 bg-white/60 text-slate-700';

  return (
    <span className={cx('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold', cls)}>
      {label}
    </span>
  );
}

function Tabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const items: Array<{ key: TabKey; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'trades', label: 'Trades' },
    { key: 'activity', label: 'Activity' },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const on = it.key === active;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={cx(
              'rounded-full border px-4 py-2 text-[12px] font-semibold transition',
              on
                ? 'border-transparent text-white shadow-sm'
                : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-white'
            )}
            style={
              on
                ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #ec4899, #22d3ee)' }
                : undefined
            }
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function BigToggle({
  on,
  loading,
  onToggle,
}: {
  on: boolean;
  loading?: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      disabled={loading}
      onClick={() => onToggle(!on)}
      className={cx(
        'relative h-12 w-[170px] rounded-full border p-1 text-left shadow-sm transition disabled:opacity-60',
        on ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white/70'
      )}
      aria-label="Autopilot toggle"
    >
      <div
        className={cx(
          'absolute top-1 h-10 w-10 rounded-full shadow-md transition-all',
          on ? 'left-[126px]' : 'left-1'
        )}
        style={{
          backgroundImage: on
            ? 'linear-gradient(135deg, #34d399, #10b981, #06b6d4)'
            : 'linear-gradient(135deg, #cbd5e1, #e2e8f0)',
        }}
      />
      <div className="flex h-full items-center justify-between px-4 text-[11px] font-extrabold uppercase tracking-[0.18em]">
        <span className={cx(on ? 'text-emerald-700' : 'text-slate-500')}>{on ? 'ON' : 'OFF'}</span>
        <span className="text-slate-400">{loading ? '...' : 'AUTOPILOT'}</span>
      </div>
    </button>
  );
}

type AccountStateResponse = {
  ok: boolean;
  open_trades?: number;
  tenant?: { id: string; email: string };
  

autopilot?: { enabled: boolean };
  broker?: { provider: string | null; platform: string | null; status: string | null };
  account?: {
    balance: number | null;
    equity: number | null;
    margin_used: number | null;
    free_margin: number | null;
    currency: string | null;
    updated_at: string | null;
  };
  error?: string;
  message?: string;
};

export default function DashboardClient() {
  const { data: session, status } = useSession();

  const email = (session?.user?.email || '').toString();

  const [tab, setTab] = useState<TabKey>('overview');

  // ---- backend: account-state ----
  const [accountState, setAccountState] = useState<AccountStateResponse | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

  // ---- overview placeholders ----
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [autopilot, setAutopilot] = useState(false);
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(true);
  const [subscriptionFounder, setSubscriptionFounder] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionPeriodEnd, setSubscriptionPeriodEnd] = useState<string | null>(null);

  const [toggleLoading, setToggleLoading] = useState(false);


  // ---- broker connect modal ----
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  const [brokerMsg, setBrokerMsg] = useState<string | null>(null);
  const [brokerErr, setBrokerErr] = useState<string | null>(null);

  const [brokerSubmitting, setBrokerSubmitting] = useState(false);
  const [brokerConsent, setBrokerConsent] = useState(false);
  const [brokerPlatform, setBrokerPlatform] = useState<'mt4' | 'mt5'>('mt5');
  const [brokerLogin, setBrokerLogin] = useState<string>('');
  const [brokerPassword, setBrokerPassword] = useState<string>('');
  const [brokerServer, setBrokerServer] = useState<string>('');
  const [aggr, setAggr] = useState<'NORMAL' | 'AGGRESSIVE'>('NORMAL');
  const [aggrSaving, setAggrSaving] = useState<boolean>(false);
  const [aggrErr, setAggrErr] = useState<string | null>(null);

  const [brokerRegion, setBrokerRegion] = useState<string>('new-york');
  const [firstName, setFirstName] = useState<string>('—');
  const [lastName, setLastName] = useState<string>('—');

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login';
  }, [status]);

  
  const reloadAccountState = async () => {
    try {
      setLoadingState(true);
      setStateError(null);

      const res = await fetch('/api/dashboard/account-state', { cache: 'no-store' });
      const j = (await res.json().catch(() => null)) as AccountStateResponse | null;

      if (!res.ok || !j?.ok) {
        setAccountState(null);
        setStateError(j?.error || 'FAILED');
        return;
      }

      setAccountState(j);
      setAutopilot(Boolean(j.autopilot?.enabled));
    } catch (e: any) {
      setAccountState(null);
      setStateError(e?.message || 'FAILED');
    } finally {
      setLoadingState(false);
    }
  };

  

  const [trades, setTrades] = useState<any[] | null>(null);
  const [tradesLoading, setTradesLoading] = useState<boolean>(false);
  const [tradesErr, setTradesErr] = useState<string | null>(null);

  const reloadTrades = async () => {
    try {
      setTradesLoading(true);
      setTradesErr(null);
      const res = await fetch('/api/dashboard/trades', { method: 'GET' });
      const j = (await res.json().catch(() => null)) as any;
      if (!res.ok || !j || j.ok !== true) {
        const msg = (j && (j.error || j.message)) ? String(j.error || j.message) : `HTTP_${res.status}`;
        setTrades(null);
        setTradesErr(msg);
        return;
      }
      setTrades(Array.isArray(j.trades) ? j.trades : []);
    } catch (e: any) {
      setTrades(null);
      setTradesErr(String(e?.message ?? e));
    } finally {
      setTradesLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'trades' && trades === null && !tradesLoading) {
      reloadTrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

// sync aggressiveness from server state
  useEffect(() => {
    const v = (accountState as any)?.aggressiveness;
    if (v === 'AGGRESSIVE' || v === 'NORMAL') setAggr(v);
  }, [accountState]);


// carica stato conto SOLO quando sei autenticato
  useEffect(() => {
    if (status !== 'authenticated') return;
    reloadAccountState();
  }, [status]);

  // overview (profilo + autopilot) – lascia così per ora
  useEffect(() => {
    const run = async () => {
      if (status !== 'authenticated') return;

      setOverviewLoading(true);
      setOverviewError(null);

      try {
        const r = await fetch('/api/dashboard/overview', { method: 'GET' });
        const j = await r.json().catch(() => null);

        if (!r.ok || !j?.ok) {
          setOverviewError(j?.error || 'OVERVIEW_FAILED');
          return;
        }

        setAutopilot(Boolean(j.autopilot?.enabled));

        
        // profile + subscription (da /api/dashboard/overview)
        setProfileEmail(String(j.profile?.email || '').toLowerCase().trim());
        setSubscriptionFounder(Boolean(j.subscription?.founder));
        setSubscriptionActive(Boolean(j.subscription?.active));
        setSubscriptionStatus((j.subscription?.status ?? null) as any);
        setSubscriptionPeriodEnd((j.subscription?.currentPeriodEnd ?? null) as any);
const p = j.profile || {};
        setFirstName((p.firstName as string) || '—');
        setLastName((p.lastName as string) || '—');
      } catch (e: any) {
        setOverviewError(e?.message || 'OVERVIEW_ERROR');
      } finally {
        setOverviewLoading(false);
      }
    };

    run();
  }, [status]);

  const sessionPill = useMemo(() => {
    if (status === 'loading') return { label: 'Loading', tone: 'neutral' as const };
    if (!email) return { label: 'No session', tone: 'warn' as const };
    return { label: 'Session OK', tone: 'ok' as const };
  }, [status, email]);

  const brokerStatus = accountState?.broker?.status || null;


  
  const brokerIsError = ['error','failed','provision_failed','inactive','disabled','rejected'].includes(String(brokerStatus || '').toLowerCase());
// BROKER_PENDING_POLL: quando pending, ricarica stato ogni 5s per max 60s
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (brokerStatus !== 'pending') return;

    let stopped = false;
    let ticks = 0;
    const maxTicks = 12; // 12 * 5s = 60s

    const id = setInterval(async () => {
      if (stopped) return;
      ticks += 1;
      try {
        await reloadAccountState();
      } catch {}

      // stop safety
      if (ticks >= maxTicks) {
        stopped = true
        clearInterval(id);
      }
    }, 5000);

    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [status, brokerStatus]);


  const brokerUx = (() => {
    if (brokerStatus === 'active') {
      return {
        title: 'Connesso',
        desc: 'Il conto è collegato. Se cambi password o server, usa “Ricollega”.',
        cta: 'Ricollega broker',
        tone: 'ok' as const,
        onClick: () => setBrokerModalOpen(true),
      };
    }
    if (brokerStatus === 'pending') {
      return {
        title: 'In attesa',
        desc: 'Stiamo collegando il conto. Premi “Verifica” per aggiornare lo stato.',
        cta: 'Verifica broker',
        tone: 'neutral' as const,
        onClick: () => reloadAccountState(),
      };
    }
    return {
      title: 'Non collegato',
      desc: 'Collega il tuo conto MT4/MT5 per vedere balance, equity e operazioni live.',
      cta: 'Collega broker',
      tone: 'warn' as const,
      onClick: () => setBrokerModalOpen(true),
    };
  })();


  const brokerPill = (() => {
    const st = (brokerStatus || '').toString().toLowerCase();
    if (st === 'active') return { label: 'Broker: Connesso', tone: 'ok' as const };
    if (st === 'pending') return { label: 'Broker: In attesa', tone: 'neutral' as const };
    if (['error','failed','provision_failed','inactive','disabled','rejected'].includes(st)) {
      return { label: 'Broker: Errore', tone: 'warn' as const };
    }
    return { label: 'Broker: Non connesso', tone: 'warn' as const };
  })();
const currency = accountState?.account?.currency || 'EUR';
  const balance = accountState?.account?.balance ?? null;
  const equity = accountState?.account?.equity ?? null;

  const openTrades = accountState?.open_trades ?? null;


  
  const submitAggressiveness = async (next: 'NORMAL' | 'AGGRESSIVE') => {
    try {
      setAggrErr(null);
      setAggrSaving(true);
      const res = await fetch('/api/account/aggressiveness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aggressiveness: next }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) {
        throw new Error(j?.error || `HTTP_${res.status}`);
      }
      setAggr(next);
      // refresh account state so UI stays in sync
      await reloadAccountState();
    } catch (e: any) {
      setAggrErr(String(e?.message || e));
    } finally {
      setAggrSaving(false);
    }
  };

const submitBrokerConnect = async () => {
    if (!brokerConsent) {
      alert('Devi accettare il consenso per collegare il conto.');
      return;
    }
    if (!brokerLogin.trim() || !brokerPassword.trim() || !brokerServer.trim()) {
      alert('Inserisci login e server del broker.');
      return;
    }

    setBrokerSubmitting(true);
    
      setBrokerMsg(null);
      setBrokerErr(null);
try {
      const res = await fetch('/api/broker/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'metaapi',
          platform: brokerPlatform,
          region: brokerRegion?.trim() || null,
          login: brokerLogin.trim(),
          password: brokerPassword.trim(),
          server: brokerServer.trim(),
        }),
      });
      const j = await res.json().catch(() => null);

      if (!res.ok || !j?.ok) {
        alert(`Collegamento non riuscito: ${j?.error || 'FAILED'}`);
        return;
      }

      setBrokerModalOpen(false);
      
      setBrokerMsg('Richiesta inviata. Stato: In attesa (provisioning)…');
      await reloadAccountState();
setBrokerConsent(false);

      // refresh dashboard state
      await reloadAccountState();
    } catch (e: any) {
      alert(e?.message || 'Errore di rete');
    } finally {
      setBrokerSubmitting(false);
    }
  };

  const toggleAutopilot = async (next: boolean) => {
    // SUBSCRIPTION_GUARD: UX blocks early (server-side also gates)
    if (next === true && !subscriptionFounder && !subscriptionActive) {
      alert('Abbonamento inattivo: rinnova per attivare Autopilot.');
      return;
    }

    setToggleLoading(true);
    try {
      const res = await fetch('/api/autopilot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profileEmail, enabled: next }),
      });
      if (!res.ok) throw new Error('toggle failed');
      setAutopilot(next);
    } catch {
      // TODO: toast
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Background “site-like” */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute -top-44 -left-44 h-[44rem] w-[44rem] rounded-full bg-indigo-400/45 blur-[120px]" />
        <div className="absolute top-10 -right-52 h-[46rem] w-[46rem] rounded-full bg-fuchsia-400/35 blur-[140px]" />
        <div className="absolute bottom-[-260px] left-1/3 h-[52rem] w-[52rem] rounded-full bg-cyan-400/35 blur-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/0 to-white/25" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: "url(/noise.png)" }} />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 opacity-30 blur-md" />
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 opacity-10 blur-xl" />
              <Image src="/branding/cerbero-logo.svg" alt="Cerbero AI" width={40} height={40} className="relative" />
            </div>

            <div className="leading-tight">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Cerbero Dashboard</div>
              <div className="text-xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-500 bg-clip-text text-transparent">
                  Cerbero
                </span>{' '}
                Dashboard
              </div>
              <div className="mt-1 text-[12px] font-semibold text-slate-500">{email || '...'}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Pill label={sessionPill.label} tone={sessionPill.tone} />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              disabled={status !== 'authenticated'}
              className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[12px] font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-60"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <Tabs active={tab} onChange={setTab} />
        </div>

        {/* Main */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Left / main */}
          <div className="lg:col-span-8">
            {tab === 'overview' && (
              <Card className="p-6 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 opacity-80" />
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Overview</div>
                    <div className="mt-1 text-2xl font-extrabold tracking-tight">Centro di controllo</div>
                    <div className="mt-2 text-[13px] text-slate-600">
                      {overviewLoading || loadingState
                        ? 'Caricamento dati…'
                        : overviewError
                        ? `Errore: ${overviewError}`
                        : stateError
                        ? `Errore: ${stateError}`
                        : 'Dati caricati.'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Pill label={brokerPill.label} tone={brokerPill.tone} />
                    <button
                      onClick={brokerUx.onClick}
                      className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[12px] font-semibold text-slate-700 shadow-sm hover:bg-white"
                    >
                      {brokerUx.cta}
                    </button>

                    <BigToggle on={autopilot} loading={toggleLoading} onToggle={toggleAutopilot} />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Balance</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums tabular-nums">{balance === null ? '—' : balance.toFixed(2)}</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-500">{currency}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Equity</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums tabular-nums">{equity === null ? '—' : equity.toFixed(2)}</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-500">{currency}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Open trades</div>
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">{openTrades === null ? '—' : String(openTrades)}</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-500">live</div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Debug</div>
                  <div className="mt-2 text-[13px] text-slate-700">
                    <code className="font-mono">
                      status={status} email={email || '—'} broker_status={brokerStatus || '—'}
                    </code>
                  </div>
                </div>
              </Card>
            )}

            {tab === 'trades' && (
              <Card className="p-6">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Trades</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-[12px] text-slate-600">
                    {tradesLoading ? 'Caricamento...' : tradesErr ? `Errore: ${tradesErr}` : trades ? `${trades.length} trade(s)` : '—'}
                  </div>
                  <button
                    onClick={reloadTrades}
                    className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-white"
                  >
                    Ricarica
                  </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/60">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-[13px]">
                      <thead>
                        <tr className="bg-white/70 text-left text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Symbol</th>
                          <th className="px-4 py-3">Side</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Size</th>
                          <th className="px-4 py-3">Entry</th>
                          <th className="px-4 py-3">Exit</th>
                          <th className="px-4 py-3">PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!trades || trades.length === 0) ? (
                          <tr>
                            <td className="px-4 py-4 text-slate-600" colSpan={8}>
                              {tradesLoading ? 'Caricamento...' : tradesErr ? `Errore: ${tradesErr}` : 'Nessun trade ancora.'}
                            </td>
                          </tr>
                        ) : (
                          trades.map((t: any, i: number) => {
                            const key = (t.id as any) || `${i}-${String(t.symbol||'')}-${String(t.ts||t.created_at||t.opened_at||'')}`;
                            const ts0 = (t.ts as any) || (t as any).created_at || (t as any).opened_at || null;
                            const cur = (accountState?.account?.currency || 'USD') as string;
                            return (
                              <tr key={key} className="border-t border-slate-200/60">
                                <td className="px-4 py-3 text-slate-700">{formatTs(ts0)}</td>
                                <td className="px-4 py-3 font-semibold text-slate-900">{String(t.symbol || '—')}</td>
                                <td className="px-4 py-3 text-slate-700">{String(t.side || '—')}</td>
                                <td className="px-4 py-3 text-slate-700">{String(t.status || '—')}</td>
                                <td className="px-4 py-3 text-slate-700">{t.size_usdc === null || t.size_usdc === undefined ? '—' : formatMoney(t.size_usdc, cur)}</td>
                                <td className="px-4 py-3 text-slate-700">{t.entry_price === null || t.entry_price === undefined ? '—' : String(t.entry_price)}</td>
                                <td className="px-4 py-3 text-slate-700">{t.exit_price === null || t.exit_price === undefined ? '—' : String(t.exit_price)}</td>
                                <td className="px-4 py-3 text-slate-700">{t.pnl_usdc === null || t.pnl_usdc === undefined ? '—' : formatMoney(t.pnl_usdc, cur)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-1 text-2xl font-extrabold tracking-tight">Operazioni</div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 p-4 text-[13px] text-slate-700">
                  UI tabella + filtri (open/closed) — poi colleghiamo a <code className="font-mono">/api/trades</code>.
                </div>
              </Card>
            )}

            {tab === 'activity' && (
              <Card className="p-6">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Activity</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">Audit & log</div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 p-4 text-[13px] text-slate-700">
                  Eventi (trade intent, executed, errori, reconnessioni) — poi <code className="font-mono">/api/audit</code>.
                </div>
              </Card>
            )}

            {tab === 'profile' && (
              <Card className="p-6">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Profile</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">Account</div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Nome</div>
                    <div className="mt-2 text-lg font-extrabold">{firstName}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Cognome</div>
                    <div className="mt-2 text-lg font-extrabold">{lastName}</div>
                  </div>
                  <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Email</div>
                    <div className="mt-2 text-lg font-extrabold">{email || '—'}</div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right / side */}
          <div className="lg:col-span-4">
            <Card className="p-6">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Mission Status</div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <span className="text-[12px] font-semibold text-slate-700">Sistema</span>
                  <Pill label="Online" tone="ok" />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <div>
                    <div className="text-[12px] font-semibold text-slate-700">Broker</div>
                    <div className="mt-1 text-[12px] text-slate-500">{brokerUx.desc}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {brokerStatus === 'active' ? (
                      <Pill label="Connesso" tone="ok" />
                    ) : brokerStatus === 'pending' ? (
                      <Pill label="In attesa" tone="neutral" />
                    ) : (
                      <Pill label="Non connesso" tone="warn" />
                    )}
                    <button
                      onClick={brokerUx.onClick}
                      className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white"
                    >
                      {brokerUx.cta}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <span className="text-[12px] font-semibold text-slate-700">Last sync</span>
                  <Pill
                    label={formatLastSync(accountState?.account?.updated_at)}
                    tone="neutral"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-slate-700">Stile di trading</span>
                    <span className="mt-1 text-[12px] text-slate-500">
                      Conservative = NORMAL • Aggressive = AGGRESSIVE
                    </span>
                    {aggrErr ? (
                      <span className="mt-1 text-[12px] text-rose-600">{aggrErr}</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={aggrSaving}
                      onClick={() => submitAggressiveness('NORMAL')}
                      className={
                        'rounded-xl border px-3 py-2 text-[12px] font-semibold transition ' +
                        (aggr === 'NORMAL'
                          ? 'border-transparent text-white'
                          : 'border-slate-200 bg-white/70 text-slate-700')
                      }
                      style={
                        aggr === 'NORMAL'
                          ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #22d3ee)' }
                          : undefined
                      }
                    >
                      Conservative
                    </button>

                    <button
                      disabled={aggrSaving}
                      onClick={() => submitAggressiveness('AGGRESSIVE')}
                      className={
                        'rounded-xl border px-3 py-2 text-[12px] font-semibold transition ' +
                        (aggr === 'AGGRESSIVE'
                          ? 'border-transparent text-white'
                          : 'border-slate-200 bg-white/70 text-slate-700')
                      }
                      style={
                        aggr === 'AGGRESSIVE'
                          ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #22d3ee)' }
                          : undefined
                      }
                    >
                      Aggressive
                    </button>
                  </div>
                </div>

              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 p-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                  Mission Control
                </div>
                <div className="mt-2 text-[12px] text-slate-600">
                  Qui metteremo alerts, rischio e ultimi eventi. Per ora: stato broker + ultimo sync.
                </div>
              </div>
</Card>
          </div>
        </div>

      {/* Broker connect modal */}
      {brokerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Broker</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">Collega il tuo conto</div>
                <div className="mt-2 text-[13px] text-slate-600">
                  Inserisci i dati del broker. Le credenziali verranno usate solo per collegare il conto tramite MetaApi e non verranno salvate.
                </div>
              </div>
              <button
                onClick={() => setBrokerModalOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <label className="text-[12px] font-semibold text-slate-700">Piattaforma</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBrokerPlatform('mt5')}
                    className={cx('flex-1 rounded-2xl border px-4 py-2 text-[12px] font-semibold',
                      brokerPlatform === 'mt5' ? 'border-transparent text-white' : 'border-slate-200 bg-white/70 text-slate-700')}
                    style={brokerPlatform === 'mt5' ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #22d3ee)' } : undefined}
                  >
                    MT5
                  </button>
                  <button
                    onClick={() => setBrokerPlatform('mt4')}
                    className={cx('flex-1 rounded-2xl border px-4 py-2 text-[12px] font-semibold',
                      brokerPlatform === 'mt4' ? 'border-transparent text-white' : 'border-slate-200 bg-white/70 text-slate-700')}
                    style={brokerPlatform === 'mt4' ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #22d3ee)' } : undefined}
                  >
                    MT4
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-[12px] font-semibold text-slate-700">Login</label>
                <input
                  value={brokerLogin}
                  onChange={(e) => setBrokerLogin(e.target.value)}
                  placeholder="Es. 12345678"
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[13px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                />

                <div className="mt-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Password</div>
                  <input
                    type="password"
                    value={brokerPassword}
                    onChange={(e) => setBrokerPassword(e.target.value)}
                    placeholder="Password broker (one-shot, non salvata)"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[13px] font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-300"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-[12px] font-semibold text-slate-700">Server</label>
                <input
                  value={brokerServer}
                  onChange={(e) => setBrokerServer(e.target.value)}
                  placeholder="Es. ICMarketsSC-Live"
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[13px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[12px] font-semibold text-slate-700">Region (opzionale)</label>
                <input
                  value={brokerRegion}
                  onChange={(e) => setBrokerRegion(e.target.value)}
                  placeholder="new-york"
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[13px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <input
                  type="checkbox"
                  checked={brokerConsent}
                  onChange={(e) => setBrokerConsent(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <div className="text-[12px] text-slate-700">
                  <div className="font-semibold">
                    Autorizzo Cerbero a utilizzare queste credenziali solo per collegare il mio conto tramite MetaApi. Le credenziali non verranno salvate.
                  </div>
                  <div className="mt-1 text-slate-500">
                    Se la password del broker cambia, la connessione verrà sospesa e dovrai ricollegare il conto.
                  </div>
                </div>
              </label>
              {brokerErr ? (
                <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-800">
                  {brokerErr}
                </div>
              ) : null}
              {brokerMsg ? (
                <div className="mb-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[12px] font-semibold text-slate-700">
                  {brokerMsg}
                </div>
              ) : null}



              <div className="flex gap-3">
                <button
                  onClick={() => setBrokerModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[13px] font-extrabold text-slate-700 hover:bg-white"
                >
                  Annulla
                </button>
                <button
                  disabled={brokerSubmitting}
                  onClick={submitBrokerConnect}
                  className="flex-1 rounded-2xl border border-transparent px-4 py-3 text-[13px] font-extrabold text-white shadow-sm disabled:opacity-60"
                  style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #ec4899, #22d3ee)' }}
                >
                  {brokerSubmitting ? 'Collegamento…' : 'Collega conto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
