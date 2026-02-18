'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X, Bell, LayoutDashboard, CandlestickChart, Server, Link, Cpu, Shield, Zap } from 'lucide-react';

type TabKey = 'overview' | 'trades';

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
  message?: string;
  trades?: TradeRow[];
};

type BillingStatusResponse = {
  email: string;
  subscription_status: string | null;
  plan_code: string | null;
  current_period_end: string | null;
  autopilot_enabled: boolean | null;
};

type AccountStateResponse = {
  ok: boolean;
  open_trades?: number;
  tenant?: { id: string; email: string };

  autopilot?: { enabled: boolean };
  broker?: { provider: string | null; platform: string | null; status: string | null };

  // presente su alcuni payload (lo stavi leggendo via any)
  aggressiveness?: 'NORMAL' | 'AGGRESSIVE' | null;

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

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(' ');
}

function errMsg(e: unknown, fallback = 'Errore') {
  if (e instanceof Error) return e.message || fallback;
  if (typeof e === 'string') return e || fallback;
  return fallback;
}

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    const t = await res.text();
    if (!t) return null;
    return JSON.parse(t) as T;
  } catch {
    return null;
  }
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

function daysUntil(ts?: string | null): number | null {
  if (!ts) return null;
  const d = new Date(ts);
  const ms = d.getTime();
  if (!isFinite(ms)) return null;
  const diff = ms - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateShort(ts?: string | null) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return String(ts);
  }
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
    return `${n.toFixed(2)} ${currency || 'USD'}`;
  }
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-3xl border border-slate-200/70 bg-white/70 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl ring-1 ring-white/40 holo-card',
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

function BigToggle({
  on,
  loading,
  disabled,
  onToggle,
}: {
  on: boolean;
  loading?: boolean;
  disabled?: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={loading || disabled}
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

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const email = (session?.user?.email || '').toString();

  const [tab, setTab] = useState<TabKey>('overview');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---- backend: account-state ----
  const [accountState, setAccountState] = useState<AccountStateResponse | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

  // ---- billing status (stripe) ----
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  // ---- UI notice ----
  const [uiNotice, setUiNotice] = useState<{ type: 'info' | 'warn' | 'error'; message: string } | null>(null);
  const [uiNoticeCta, setUiNoticeCta] = useState<'connect_broker' | 'open_portal' | null>(null);

  // ---- overview status ----
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // ---- autopilot + subscription gates ----
  const [autopilot, setAutopilot] = useState(false);
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(true);
  const [subscriptionFounder, setSubscriptionFounder] = useState<boolean>(false);
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

  // aggressiveness
  const [aggr, setAggr] = useState<'NORMAL' | 'AGGRESSIVE'>('NORMAL');
  const [aggrSaving, setAggrSaving] = useState<boolean>(false);
  const [aggrErr, setAggrErr] = useState<string | null>(null);

  // trades
  const [trades, setTrades] = useState<TradeRow[] | null>(null);
  const [tradesLoading, setTradesLoading] = useState<boolean>(false);
  const [tradesErr, setTradesErr] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login';
  }, [status]);

  const reloadAccountState = async () => {
    try {
      setLoadingState(true);
      setStateError(null);

      const res = await fetch('/api/dashboard/account-state', { cache: 'no-store' });
      const j = await safeJson<AccountStateResponse>(res);

      if (!res.ok || !j?.ok) {
        setAccountState(null);
        setStateError(j?.error || `HTTP_${res.status}`);
        return;
      }

      setAccountState(j);
      setAutopilot(Boolean(j.autopilot?.enabled));
      if (j.aggressiveness === 'NORMAL' || j.aggressiveness === 'AGGRESSIVE') setAggr(j.aggressiveness);
    } catch (e: unknown) {
      setAccountState(null);
      setStateError(errMsg(e, 'FAILED'));
    } finally {
      setLoadingState(false);
    }
  };

  const reloadTrades = async () => {
    try {
      setTradesLoading(true);
      setTradesErr(null);

      const res = await fetch('/api/dashboard/trades', { method: 'GET' });
      const j = await safeJson<TradesResponse>(res);

      if (!res.ok || !j || j.ok !== true) {
        const msg = j?.error || j?.message || `HTTP_${res.status}`;
        setTrades(null);
        setTradesErr(msg);
        return;
      }

      setTrades(Array.isArray(j.trades) ? j.trades : []);
    } catch (e: unknown) {
      setTrades(null);
      setTradesErr(errMsg(e, 'Trades error'));
    } finally {
      setTradesLoading(false);
    }
  };

  // carica stato conto SOLO quando sei autenticato
  useEffect(() => {
    if (status !== 'authenticated') return;
    reloadAccountState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // load trades when tab opens
  useEffect(() => {
    if (tab === 'trades' && trades === null && !tradesLoading) reloadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // overview (profilo + autopilot + subscription)
  useEffect(() => {
    const run = async () => {
      if (status !== 'authenticated') return;

      setOverviewLoading(true);
      setOverviewError(null);

      try {
        const res = await fetch('/api/dashboard/overview', { method: 'GET' });
        const j = await safeJson<{
          ok: boolean;
          error?: string;
          autopilot?: { enabled?: boolean };
          profile?: { email?: string };
          subscription?: { founder?: boolean; active?: boolean };
        }>(res);

        if (!res.ok || !j?.ok) {
          setOverviewError(j?.error || `HTTP_${res.status}`);
          return;
        }

        setAutopilot(Boolean(j.autopilot?.enabled));
        setProfileEmail(String(j.profile?.email || '').toLowerCase().trim());
        setSubscriptionFounder(Boolean(j.subscription?.founder));
        setSubscriptionActive(Boolean(j.subscription?.active));
      } catch (e: unknown) {
        setOverviewError(errMsg(e, 'OVERVIEW_ERROR'));
      } finally {
        setOverviewLoading(false);
      }
    };

    run();
  }, [status]);

  // billing status (stripe)
  useEffect(() => {
    const em = String(session?.user?.email || '').trim().toLowerCase();
    if (!em) return;

    let cancelled = false;
    setBillingLoading(true);
    setBillingError(null);

    fetch('/api/billing/status', { method: 'GET' })
      .then(async (r) => {
        const j = await safeJson<BillingStatusResponse & { error?: string; detail?: { code?: string } }>(r);
        if (!r.ok) throw new Error(j?.error || j?.detail?.code || 'BILLING_STATUS_FAILED');
        return j as BillingStatusResponse | null;
      })
      .then((j) => {
        if (cancelled) return;
        if (j) setBillingStatus(j);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBillingError(errMsg(e, 'Billing status error'));
      })
      .finally(() => {
        if (cancelled) return;
        setBillingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  const bannerKey = useMemo(() => {
    const cpe = billingStatus?.current_period_end || '';
    const st = billingStatus?.subscription_status || '';
    return `cerbero_banner_v1:${st}:${cpe}`;
  }, [billingStatus?.current_period_end, billingStatus?.subscription_status]);

  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(bannerKey);
      setBannerDismissed(v === '1');
    } catch {}
  }, [bannerKey]);

  const dismissBanner = () => {
    try {
      localStorage.setItem(bannerKey, '1');
    } catch {}
    setBannerDismissed(true);
  };

  const banner = useMemo(() => {
    if (!billingStatus) return null;
    const st = (billingStatus.subscription_status || 'inactive').toLowerCase();
    const isActive = st === 'active' || st === 'trialing';
    const cpe = billingStatus.current_period_end || null;

    if (!isActive) {
      return {
        tone: 'warn' as const,
        title: 'Abbonamento inattivo',
        body: 'Autopilot è in pausa. Gestisci l’abbonamento per riattivare il servizio.',
        cta: 'Gestisci abbonamento',
      };
    }

    const dleft = daysUntil(cpe);
    if (typeof dleft === 'number' && isFinite(dleft) && dleft >= 0 && dleft <= 3) {
      return {
        tone: 'neutral' as const,
        title: `Scade tra ${dleft} ${dleft === 1 ? 'giorno' : 'giorni'}`,
        body: 'Per evitare interruzioni, verifica il metodo di pagamento dal portale.',
        cta: 'Gestisci abbonamento',
      };
    }

    return null;
  }, [billingStatus]);

  const openPortal = async () => {
    try {
      setBillingError(null);
      const r = await fetch('/api/billing/create-portal-session', { method: 'POST' });
      const j = await safeJson<{ url?: string; error?: string; detail?: { code?: string } }>(r);
      if (!r.ok) throw new Error(j?.error || j?.detail?.code || 'PORTAL_FAILED');
      const url = j?.url;
      if (url) window.location.href = url;
      else throw new Error('PORTAL_URL_MISSING');
    } catch (e: unknown) {
      setBillingError(errMsg(e, 'Portal error'));
    }
  };

  const brokerStatus = accountState?.broker?.status || null;

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

      if (ticks >= maxTicks) {
        stopped = true;
        clearInterval(id);
      }
    }, 5000);

    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (['error', 'failed', 'provision_failed', 'inactive', 'disabled', 'rejected'].includes(st)) {
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

      const j = await safeJson<{ ok?: boolean; error?: string }>(res);
      if (!res.ok || !j?.ok) throw new Error(j?.error || `HTTP_${res.status}`);

      setAggr(next);
      await reloadAccountState();
    } catch (e: unknown) {
      setAggrErr(errMsg(e, 'Aggressiveness error'));
    } finally {
      setAggrSaving(false);
    }
  };

  const submitBrokerConnect = async () => {
    if (!brokerConsent) {
      setBrokerErr('Devi accettare il consenso per collegare il conto.');
      setBrokerMsg(null);
      return;
    }
    if (!brokerLogin.trim() || !brokerPassword.trim() || !brokerServer.trim()) {
      setBrokerErr('Inserisci login, password e server del broker.');
      setBrokerMsg(null);
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
          login: brokerLogin.trim(),
          password: brokerPassword.trim(),
          server: brokerServer.trim(),
        }),
      });

      const j = await safeJson<{ ok?: boolean; error?: string }>(res);

      if (!res.ok || !j?.ok) {
        setBrokerErr(`Collegamento non riuscito: ${j?.error || 'FAILED'}`);
        setBrokerMsg(null);
        return;
      }

      setBrokerModalOpen(false);
      setBrokerMsg('Richiesta inviata. Stato: In attesa (provisioning)…');
      setBrokerConsent(false);

      await reloadAccountState();
    } catch (e: unknown) {
      setBrokerErr(errMsg(e, 'Errore di rete'));
      setBrokerMsg(null);
    } finally {
      setBrokerSubmitting(false);
    }
  };

  const toggleAutopilot = async (next: boolean) => {
    // BROKER_GUARD: do not allow enabling autopilot without an active broker connection
    if (next === true && brokerStatus !== 'active') {
      setUiNotice({ type: 'warn', message: 'Per attivare Autopilot collega prima il broker.' });
      setUiNoticeCta('connect_broker');
      return;
    }

    // SUBSCRIPTION_GUARD
    if (next === true && !subscriptionFounder && !subscriptionActive) {
      setUiNotice({ type: 'warn', message: 'Abbonamento inattivo: rinnova per attivare Autopilot.' });
      setUiNoticeCta('open_portal');
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">
      {/* Background soft holo */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-[22rem] w-[22rem] rounded-full bg-cyan-400/20 blur-[120px] -z-10" />
      <div className="pointer-events-none fixed bottom-10 -right-24 h-[22rem] w-[22rem] rounded-full bg-fuchsia-400/20 blur-[120px] -z-10" />

      {/* Background “site-like” */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute -top-44 -left-44 h-[44rem] w-[44rem] rounded-full bg-indigo-400/45 blur-[120px]" />
        <div className="absolute top-10 -right-52 h-[46rem] w-[46rem] rounded-full bg-fuchsia-400/35 blur-[140px]" />
        <div className="absolute bottom-[-260px] left-1/3 h-[52rem] w-[52rem] rounded-full bg-cyan-400/35 blur-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/0 to-white/25" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: 'url(/noise.png)' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 md:pl-64">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-700 shadow-sm hover:bg-slate-50"
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="md:hidden flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] shadow-[0_0_20px_-6px_rgba(6,182,212,0.35)]">
                <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center">
                  <Image src="/branding/cerbero-logo.svg" alt="Cerbero AI" width={22} height={22} />
                </div>
              </div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                Cerbero<span className="text-cyan-600">AI</span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Dashboard</div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900">
                {tab === 'trades' ? 'Live Trades' : 'Overview'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Pill label="System Online" tone="ok" />
            </div>

            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-2.5 py-2 text-slate-600 shadow-sm hover:text-fuchsia-600"
              aria-label="Notifiche"
            >
              <Bell className="h-5 w-5" />
            </button>

            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] shadow-[0_0_20px_-6px_rgba(236,72,153,0.35)]">
              <div className="h-full w-full rounded-full bg-white/90 flex items-center justify-center text-[12px] font-extrabold text-slate-700">
                {email ? String(email).slice(0, 1).toUpperCase() : 'C'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={
          'fixed top-0 left-0 z-[60] h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur-xl p-6 pt-6 ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full') +
          ' md:translate-x-0 transition-transform duration-300 ease-in-out'
        }
      >
        <div className="flex items-center justify-between md:justify-start md:gap-3">
          <div className="hidden md:flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] shadow-[0_0_20px_-6px_rgba(6,182,212,0.35)]">
              <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center">
                <Image src="/branding/cerbero-logo.svg" alt="Cerbero AI" width={22} height={22} />
              </div>
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-900">
              Cerbero<span className="text-cyan-600">AI</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Chiudi menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400">Main Menu</div>

        <nav className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              setTab('overview');
              setSidebarOpen(false);
            }}
            className={
              'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition ' +
              (tab === 'overview'
                ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_-6px_rgba(6,182,212,0.35)]'
                : 'text-slate-700 hover:bg-white/60')
            }
          >
            <LayoutDashboard className="h-5 w-5 opacity-90" />
            <span className="text-[13px]">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('trades');
              setSidebarOpen(false);
            }}
            className={
              'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition ' +
              (tab === 'trades'
                ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_-6px_rgba(6,182,212,0.35)]'
                : 'text-slate-700 hover:bg-white/60')
            }
          >
            <CandlestickChart className="h-5 w-5 opacity-90" />
            <span className="text-[13px]">Live Trades</span>
          </button>

          <div className="mt-2 rounded-2xl border border-slate-200 bg-white/50 p-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Account</div>
            <div className="mt-2 text-[12px] font-semibold text-slate-700 break-all">{email || '—'}</div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              disabled={status !== 'authenticated'}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-[12px] font-extrabold text-slate-700 hover:bg-white disabled:opacity-60"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-label="Chiudi menu overlay"
        />
      ) : null}

      <main className="pt-24 p-4 md:p-8 md:ml-64 relative z-10">
        <div className="mx-auto max-w-6xl">
          {uiNotice ? (
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[13px] font-semibold text-slate-800">{uiNotice.message}</div>
                <div className="flex flex-wrap gap-2">
                  {uiNoticeCta === 'connect_broker' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUiNotice(null);
                        setUiNoticeCta(null);
                        setBrokerModalOpen(true);
                      }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white"
                    >
                      Collega broker
                    </button>
                  ) : null}

                  {uiNoticeCta === 'open_portal' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUiNotice(null);
                        setUiNoticeCta(null);
                        openPortal();
                      }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white"
                    >
                      Gestisci abbonamento
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setUiNotice(null);
                      setUiNoticeCta(null);
                    }}
                    className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {tab === 'overview' ? (
                <Card className="p-6 relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 opacity-80" />

                  {!bannerDismissed && banner ? (
                    <div
                      className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm relative overflow-hidden"
                      data-testid="cerbero-banner"
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 20% 0%, rgba(34,211,238,0.35), transparent 55%), radial-gradient(circle at 80% 10%, rgba(236,72,153,0.22), transparent 55%)',
                        }}
                      />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-9 w-9 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center">
                            <Image src="/branding/cerbero-logo.svg" alt="Cerbero" width={22} height={22} />
                          </div>
                          <div>
                            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                              {banner.tone === 'warn' ? 'Billing' : 'Promemoria'}
                            </div>
                            <div className="mt-1 text-[15px] font-extrabold text-slate-900">{banner.title}</div>
                            <div className="mt-1 text-[13px] font-semibold text-slate-600">{banner.body}</div>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={openPortal}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-800 shadow-sm hover:bg-white"
                              >
                                {banner.cta}
                              </button>
                              <div className="text-[12px] font-semibold text-slate-500">
                                Puoi gestire il piano anche dalla sezione “Abbonamento”.
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={dismissBanner}
                          className="relative z-10 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[12px] font-extrabold text-slate-600 hover:bg-white"
                          aria-label="Chiudi banner"
                          title="Chiudi"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                        type="button"
                        onClick={brokerUx.onClick}
                        className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[12px] font-semibold text-slate-700 shadow-sm hover:bg-white"
                      >
                        {brokerUx.cta}
                      </button>

                      <BigToggle on={autopilot} loading={toggleLoading} disabled={brokerStatus !== 'active'} onToggle={toggleAutopilot} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Balance</div>
                      <div className="mt-2 text-3xl font-extrabold tabular-nums">{balance === null ? '—' : balance.toFixed(2)}</div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-500">{currency}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Equity</div>
                      <div className="mt-2 text-3xl font-extrabold tabular-nums">{equity === null ? '—' : equity.toFixed(2)}</div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-500">{currency}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:shadow-[0_18px_50px_-30px_rgba(236,72,153,0.35)]">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Open trades</div>
                      <div className="mt-2 text-3xl font-extrabold tabular-nums">{openTrades === null ? '—' : String(openTrades)}</div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-500">live</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Abbonamento</div>
                        <div className="mt-1 text-[13px] font-semibold text-slate-700">
                          {billingLoading ? 'Caricamento…' : billingError ? `Errore: ${billingError}` : billingStatus ? 'Stato aggiornato.' : '—'}
                        </div>
                      </div>

                      <Pill
                        label={billingLoading ? 'LOADING' : (billingStatus?.subscription_status || 'inactive').toUpperCase()}
                        tone={
                          billingLoading
                            ? 'neutral'
                            : billingStatus?.subscription_status === 'active' || billingStatus?.subscription_status === 'trialing'
                            ? 'ok'
                            : billingStatus?.subscription_status === 'past_due'
                            ? 'warn'
                            : 'neutral'
                        }
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Piano</div>
                        <div className="mt-1 text-[13px] font-semibold text-slate-800">{billingStatus?.plan_code || '—'}</div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Scadenza</div>
                        <div className="mt-1 text-[13px] font-semibold text-slate-800">
                          {formatDateShort(billingStatus?.current_period_end || null)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Autopilot</div>
                        <div className="mt-1 text-[13px] font-semibold text-slate-800">
                          {billingStatus?.autopilot_enabled === true ? 'ON' : billingStatus?.autopilot_enabled === false ? 'OFF' : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={openPortal}
                        disabled={billingLoading || !billingStatus}
                        className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-800 shadow-sm hover:bg-white disabled:opacity-60"
                      >
                        Gestisci abbonamento
                      </button>
                      <div className="text-[12px] font-semibold text-slate-500">
                        Modifica metodo di pagamento, annulla o aggiorna piano dal portale Stripe.
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Trades</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[12px] text-slate-600">
                      {tradesLoading ? 'Caricamento...' : tradesErr ? `Errore: ${tradesErr}` : trades ? `${trades.length} trade(s)` : '—'}
                    </div>
                    <button
                      type="button"
                      onClick={reloadTrades}
                      className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-white"
                    >
                      Ricarica
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {!trades || trades.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-[13px] text-slate-700">
                        {tradesLoading ? 'Caricamento...' : tradesErr ? `Errore: ${tradesErr}` : 'Nessun trade ancora.'}
                      </div>
                    ) : (
                      trades.map((t: TradeRow, i: number) => {
                        const key = t.id || `${i}-${String(t.symbol || '')}-${String(t.ts || t.created_at || t.opened_at || '')}`;
                        const ts0 = t.ts || t.created_at || t.opened_at || null;
                        const cur = (accountState?.account?.currency || 'USD') as string;

                        const symbol = String(t.symbol || '—');
                        const side = String(t.side || '—');
                        const st = String(t.status || '—');

                        const sizeStr = t.size_usdc == null ? '—' : formatMoney(t.size_usdc, cur);
                        const entryStr = t.entry_price == null ? '—' : String(t.entry_price);
                        const exitStr = t.exit_price == null ? '—' : String(t.exit_price);
                        const pnlStr = t.pnl_usdc == null ? '—' : formatMoney(t.pnl_usdc, cur);

                        return (
                          <div
                            key={key}
                            className="group relative rounded-[2rem] border border-white/40 bg-white/70 p-4 shadow-[0_18px_60px_-40px_rgba(31,38,135,0.35)] backdrop-blur-xl"
                          >
                            <div className="pointer-events-none absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 opacity-70" />
                            <div
                              className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              style={{
                                boxShadow: '0 0 30px -10px rgba(6,182,212,0.35), 0 0 34px -14px rgba(236,72,153,0.35)',
                              }}
                            />

                            <div className="relative">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-[18px] font-extrabold tracking-tight text-gradient-cyber">{symbol}</div>
                                    <span className="rounded-full border border-white/50 bg-white/60 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 shadow-sm">
                                      {side}
                                    </span>
                                    <span className="rounded-full border border-white/50 bg-white/60 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 shadow-sm">
                                      {st}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[12px] text-slate-500">{formatTs(ts0)}</div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">PnL</div>
                                  <div
                                    className={
                                      'mt-1 text-[16px] font-extrabold ' +
                                      (t.pnl_usdc == null
                                        ? 'text-slate-900'
                                        : Number(t.pnl_usdc) > 0
                                        ? 'text-emerald-600'
                                        : Number(t.pnl_usdc) < 0
                                        ? 'text-rose-600'
                                        : 'text-slate-700')
                                    }
                                  >
                                    {pnlStr}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-white/50 bg-white/60 p-3 shadow-[0_10px_30px_-22px_rgba(31,38,135,0.35)] backdrop-blur-xl">
                                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Size</div>
                                  <div className="mt-1 text-[13px] font-semibold text-slate-800">{sizeStr}</div>
                                </div>
                                <div className="rounded-2xl border border-white/50 bg-white/60 p-3 shadow-[0_10px_30px_-22px_rgba(31,38,135,0.35)] backdrop-blur-xl">
                                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Entry</div>
                                  <div className="mt-1 text-[13px] font-semibold text-slate-800">{entryStr}</div>
                                </div>
                                <div className="rounded-2xl border border-white/50 bg-white/60 p-3 shadow-[0_10px_30px_-22px_rgba(31,38,135,0.35)] backdrop-blur-xl">
                                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Exit</div>
                                  <div className="mt-1 text-[13px] font-semibold text-slate-800">{exitStr}</div>
                                </div>
                                <div className="rounded-2xl border border-white/50 bg-white/60 p-3 shadow-[0_10px_30px_-22px_rgba(31,38,135,0.35)] backdrop-blur-xl">
                                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Stato</div>
                                  <div className="mt-1 text-[13px] font-semibold text-slate-800">{st}</div>
                                </div>
                              </div>

                              <div className="mt-4 rounded-[2rem] border border-white/50 bg-gradient-to-br from-white/60 to-fuchsia-50/30 p-4 shadow-[0_12px_36px_-28px_rgba(236,72,153,0.35)] backdrop-blur-xl">
                                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">AI Reasoning</div>
                                <div className="mt-1 text-[12px] text-slate-600">
                                  Placeholder: qui mostreremo una spiegazione in linguaggio naturale (arriverà dal cervello). Per ora UI pronta.
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 p-4 text-[13px] text-slate-700">
                    UI tabella + filtri (open/closed) — poi colleghiamo a <code className="font-mono">/api/trades</code>.
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
                    <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                      <Server className="h-4 w-4 text-cyan-600" />
                      Sistema
                    </span>
                    <Pill label="Online" tone="ok" />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div>
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                        <Link className="h-4 w-4 text-fuchsia-600" />
                        Broker
                      </div>
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
                        type="button"
                        onClick={brokerUx.onClick}
                        className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white"
                      >
                        {brokerUx.cta}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <span className="text-[12px] font-semibold text-slate-700">Last sync</span>
                    <Pill label={formatLastSync(accountState?.account?.updated_at)} tone="neutral" />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                        <Cpu className="h-4 w-4 text-violet-600" />
                        Stile di trading
                      </span>
                      <span className="mt-1 text-[12px] text-slate-500">Conservative = NORMAL • Aggressive = AGGRESSIVE</span>
                      {aggrErr ? <span className="mt-1 text-[12px] text-rose-600">{aggrErr}</span> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={aggrSaving}
                        onClick={() => submitAggressiveness('NORMAL')}
                        className={
                          'rounded-xl border px-3 py-2 text-[12px] font-semibold transition ' +
                          (aggr === 'NORMAL' ? 'border-transparent text-white' : 'border-slate-200 bg-white/70 text-slate-700')
                        }
                        style={
                          aggr === 'NORMAL'
                            ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #22d3ee)' }
                            : undefined
                        }
                      >
                        <span className="inline-flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Conservative
                        </span>
                      </button>

                      <button
                        type="button"
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
                        <span className="inline-flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Aggressive
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Broker connect modal */}
      {brokerModalOpen ? (
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
                type="button"
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
                    type="button"
                    onClick={() => setBrokerPlatform('mt5')}
                    className={cx(
                      'flex-1 rounded-2xl border px-4 py-2 text-[12px] font-semibold',
                      brokerPlatform === 'mt5' ? 'border-transparent text-white' : 'border-slate-200 bg-white/70 text-slate-700'
                    )}
                    style={
                      brokerPlatform === 'mt5'
                        ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #22d3ee)' }
                        : undefined
                    }
                  >
                    MT5
                  </button>

                  <button
                    type="button"
                    onClick={() => setBrokerPlatform('mt4')}
                    className={cx(
                      'flex-1 rounded-2xl border px-4 py-2 text-[12px] font-semibold',
                      brokerPlatform === 'mt4' ? 'border-transparent text-white' : 'border-slate-200 bg-white/70 text-slate-700'
                    )}
                    style={
                      brokerPlatform === 'mt4'
                        ? { backgroundImage: 'linear-gradient(135deg, #4f46e5, #a855f7, #22d3ee)' }
                        : undefined
                    }
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
                  type="button"
                  onClick={() => setBrokerModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[13px] font-extrabold text-slate-700 hover:bg-white"
                >
                  Annulla
                </button>

                <button
                  type="button"
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
      ) : null}
    </div>
  );
}
