'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X, LayoutDashboard, CandlestickChart, Shield, Zap, Info } from 'lucide-react';

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
  why?: {
    reasons?: any;
    strategy_origin?: string | null;
    strength?: string | null;
  } | null;
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


function trackGaEvent(name: string, params?: Record<string, any>) {
  try {
    // @ts-ignore
    window.gtag?.("event", name, params || {});
  } catch {}
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
        'rounded-3xl border border-white/14 bg-white/3 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.65)] ring-1 ring-white/10',
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
  className = '',
}: {
  label: string;
  tone?: 'neutral' | 'ok' | 'warn';
  className?: string;
}) {
  const cls =
    tone === 'ok'
      ? 'border-emerald-400/25 bg-emerald-400/12 text-emerald-100'
      : tone === 'warn'
      ? 'border-amber-400/25 bg-amber-400/12 text-amber-100'
      : 'border-white/18 bg-white/3 text-slate-100';

  return <span className={cx('inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-semibold', cls, className)}>{label}</span>;
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_20px_60px_-30px_rgba(236,72,153,0.45)] transition hover:brightness-110 disabled:',
        className
      )}
      style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)' }}
    >
      {children}
    </button>
  );
}

function SoftButton({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center rounded-xl border border-white/18 bg-white/3 px-4 py-2 text-[12px] font-extrabold text-slate-100 transition hover:bg-white/15 disabled:',
        className
      )}
    >
      {children}
    </button>
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
        'relative h-12 w-[170px] rounded-full border p-1 text-left shadow-sm transition disabled:',
        on ? 'border-emerald-400/25 bg-emerald-400/12' : 'border-white/18 bg-white/3'
      )}
      aria-label="Autopilot toggle"
    >
      <div
        className={cx('absolute top-1 h-10 w-10 rounded-full shadow-md transition-all', on ? 'left-[126px]' : 'left-1')}
        style={{
          backgroundImage: on
            ? 'linear-gradient(135deg, #34d399, #10b981, #06b6d4)'
            : 'linear-gradient(135deg, rgba(148,163,184,0.8), rgba(226,232,240,0.35))',
        }}
      />
      <div className="flex h-full items-center justify-between px-4 text-[11px] font-extrabold uppercase tracking-[0.18em]">
        <span className={cx(on ? 'text-emerald-100' : 'text-slate-100')}>{on ? 'ON' : 'OFF'}</span>
        <span className="text-slate-200/70">{loading ? '...' : 'AUTOPILOT'}</span>
      </div>
    </button>
  );
}

/** Mini badge (ok boxed) */
function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl p-[2px] shadow-[0_0_40px_-18px_rgba(6,182,212,0.55)]"
      style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)' }}
    >
      <div className="flex items-center justify-center" style={{ width: size + 12, height: size + 12 }}>
        <Image src="/branding/cerbero-logo.svg" alt="Cerbero AI" width={size} height={size} />
      </div>
    </div>
  );
}

/** Logo principale (NO BOX) */
function BrandLogo({ size = 34 }: { size?: number }) {
  return (
    <Image
      src="/branding/cerbero-logo.svg"
      alt="Cerbero AI"
      width={size}
      height={size}
      className="block"
      priority
    />
  );
}

function BrandWordmark() {
  return (
    <div className="text-xl font-extrabold tracking-tight text-white">
      Cerbero
      <span className="bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">AI</span>
    </div>
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

  // ---- UI notice (alerts) ----
  const [uiNotice, setUiNotice] = useState<{ type: 'info' | 'warn' | 'error'; message: string } | null>(null);

  const [openWhyKey, setOpenWhyKey] = useState<string | null>(null);
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
  const [brokerDisconnecting, setBrokerDisconnecting] = useState(false);
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

    const [tradesScope, setTradesScope] = useState<"live" | "history">("live");

useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login';
  }, [status]);

  // GA: signup completato (solo dopo auth reale, una sola volta)
  useEffect(() => {
    if (status !== 'authenticated') return;
    const em = String(session?.user?.email || '').trim().toLowerCase();
    if (!em) return;

    try {
      const pending = localStorage.getItem("cerbero_pending_signup");
      if (!pending) return;

      const onceKey = `cerbero_ga_once:event_signup_complete:${em}`;
      if (localStorage.getItem(onceKey) === "1") {
        // pulizia marker pending, in caso sia rimasto
        localStorage.removeItem("cerbero_pending_signup");
        return;
      }

      trackGaEvent("event_signup_complete", { email: em });
      localStorage.setItem(onceKey, "1");
      localStorage.removeItem("cerbero_pending_signup");
    } catch {}
  }, [status, session?.user?.email]);


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

  const reloadTrades = async (scope?: 'live' | 'history') => {
    try {
      const sc = (scope || tradesScope || 'live');
      setTradesLoading(true);
      setTradesErr(null);

      const res = await fetch(`/api/dashboard/trades?scope=`, { method: 'GET' });
      const j = await safeJson<TradesResponse>(res);

      if (!res.ok || !j || j.ok !== true) {
        const msg = j?.error || j?.message || `HTTP_`;
        setTrades(null);
        setTradesErr(msg);
        return;
      }

      setTrades(Array.isArray(j.trades) ? j.trades : []);
      setTradesScope(sc as any);
    } catch (e: unknown) {
      setTrades(null);
      setTradesErr(errMsg(e, 'Trades error'));
    } finally {
      setTradesLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    reloadAccountState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (tab === 'trades' && trades === null && !tradesLoading) reloadTrades(tradesScope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (brokerStatus !== 'pending') return;

    let stopped = false;
    let ticks = 0;
    const maxTicks = 12; // 60s

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
    if (st === 'active') return { label: 'Broker connesso', tone: 'ok' as const };
    if (st === 'pending') return { label: 'Broker in attesa', tone: 'neutral' as const };
    if (['error', 'failed', 'provision_failed', 'inactive', 'disabled', 'rejected'].includes(st)) return { label: 'Broker in errore', tone: 'warn' as const };
    return { label: 'Broker non connesso', tone: 'warn' as const };
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


  const submitBrokerDisconnect = async () => {
  try {
    setBrokerDisconnecting(true);
    setBrokerErr(null);
    setBrokerMsg(null);


    if (!confirm("Prima di disconnettere: spegni Autopilot e assicurati di non avere posizioni aperte. Vuoi continuare?") ) {
      setBrokerDisconnecting(false);
      return;
    }
    const res = await fetch('/api/broker/disconnect', { method: 'POST' });
    const j = await res.json().catch(() => null);

    if (!res.ok || j?.ok === false) {
      const msg =
        (j && (j.user_message || j.error || j.code)) ||
        `HTTP_${res.status}`;
      setBrokerErr(String(msg));
      setBrokerMsg(null);
      return;
    }

    setBrokerMsg('Broker disconnesso.');
    setBrokerErr(null);

    // refresh stato dashboard (se hai già questa fetch altrove, qui è safe ripeterla)
    // opzionale: ricarica pagina per riflettere subito lo stato
    // window.location.reload();

  } catch (e: unknown) {
    const msg = String(e instanceof Error ? e.message : e);
    setBrokerErr(msg || 'Errore di rete');
    setBrokerMsg(null);
  } finally {
    setBrokerDisconnecting(false);
  }
};  const toggleAutopilot = async (next: boolean) => {
    if (next === true && brokerStatus !== 'active') {
      setUiNotice({ type: 'warn', message: 'Per attivare Autopilot collega prima il broker.' });
      setUiNoticeCta('connect_broker');
      return;
    }

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
      // TODO toast
    } finally {
      setToggleLoading(false);
    }
  };

  const systemPill = autopilot ? { label: 'Sistema: Online', tone: 'ok' as const } : { label: 'Sistema: Offline', tone: 'warn' as const };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#05060b]" />
        <div className="absolute inset-0 opacity-[0.55]" style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/14 via-white/6 to-white/0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.14),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: 'url(/noise.png)' }} />
      </div>

      {/* Sidebar */}
      <aside
        className={
          'fixed top-0 left-0 z-[60] h-screen w-72 md:w-64 p-6 pt-6 ' +
          'border-r border-white/20 ' +
          'bg-white/3 ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full') +
          ' md:translate-x-0 transition-transform duration-300 ease-in-out'
        }
      >
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-white/0" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/25 blur-[90px]" />
          <div className="absolute top-10 -right-28 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-[110px]" />
          <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-violet-400/20 blur-[120px]" />
        </div>

        <div className="flex items-center justify-between md:justify-start md:gap-3">
          <div className="hidden md:flex items-center gap-3">
            <BrandLogo size={38} />
            <BrandWordmark />
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden rounded-xl border border-white/18 bg-white/3 px-2.5 py-2 text-slate-100 shadow-sm hover:bg-white/15"
            aria-label="Chiudi menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          <button
            type="button"
            onClick={() => {
              setTab('overview');
              setSidebarOpen(false);
            }}
            className={
              'w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold transition ' +
              (tab === 'overview' ? 'text-white' : 'text-slate-100 hover:bg-white/3')
            }
            style={
              tab === 'overview'
                ? { backgroundImage: 'linear-gradient(135deg, rgba(6,182,212,0.35), rgba(139,92,246,0.28), rgba(236,72,153,0.30))' }
                : undefined
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[13px]">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('trades');
              setTradesScope("live");
              setTrades(null);
              setSidebarOpen(false);
            }}
            className={
              'w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold transition ' +
              (tab === 'trades' ? 'text-white' : 'text-slate-100 hover:bg-white/3')
            }
            style={
              tab === 'trades'
                ? { backgroundImage: 'linear-gradient(135deg, rgba(6,182,212,0.28), rgba(139,92,246,0.28), rgba(236,72,153,0.35))' }
                : undefined
            }
          >
            <CandlestickChart className="h-5 w-5" />
            <span className="text-[13px]">Live Trades</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("trades");
              setTradesScope("history");
              setTrades(null);
              setSidebarOpen(false);
            }}
            className={
              "w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold transition " +
              (tab === "trades" && tradesScope === "history" ? "text-white" : "text-slate-100 hover:bg-white/3")
            }
            style={
              tab === "trades" && tradesScope === "history"
                ? { backgroundImage: "linear-gradient(135deg, rgba(6,182,212,0.22), rgba(139,92,246,0.30), rgba(236,72,153,0.22))" }
                : undefined
            }
          >
            <CandlestickChart className="h-5 w-5" />
            <span className="text-[13px]">Trade History</span>
          </button>


          <div className="mt-4 rounded-3xl border border-white/18 bg-white/3 p-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/80">Account</div>
            <div className="mt-2 text-[12px] font-semibold text-white break-all">{email || '—'}</div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">Stato</div>
              <Pill label={systemPill.label} tone={systemPill.tone} />
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              disabled={status !== 'authenticated'}
              className="mt-3 w-full rounded-2xl border border-white/18 bg-white/3 px-3 py-2 text-[12px] font-extrabold text-white hover:bg-white/15 disabled:"
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
          className="fixed inset-0 z-50 bg-black/55 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-label="Chiudi menu overlay"
        />
      ) : null}

      {/* Mobile top bar (minimal, NO overlap) */}
      <div className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-white/18 bg-black/25 px-3 py-2 text-white hover:bg-black/35"
            aria-label="Apri menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-3 py-2 shadow-[0_18px_60px_-35px_rgba(0,0,0,0.6)]">
            <BrandLogo size={26} />
            <div className="text-[15px] font-extrabold tracking-tight text-white/90">
              Cerbero<span className="text-cyan-300">AI</span>
            </div>
          </div>

          <div className="w-[44px]" />
        </div>
      </div>

      <main className="p-4 pt-20 md:pt-10 md:p-8 md:ml-64 relative z-10">
        <div className="mx-auto max-w-6xl">
          {uiNotice ? (
            <div className="mb-6 rounded-3xl border border-white/18 bg-white/3 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[13px] font-semibold text-white">{uiNotice.message}</div>
                <div className="flex flex-wrap gap-2">
                  {uiNoticeCta === 'connect_broker' ? (
                    <PrimaryButton
                      onClick={() => {
                        setUiNotice(null);
                        setUiNoticeCta(null);
                        setBrokerModalOpen(true);
                      }}
                      className="px-3 py-2"
                    >
                      Collega broker
                    </PrimaryButton>
                  ) : null}

                  {uiNoticeCta === 'open_portal' ? (
                    <PrimaryButton
                      onClick={() => {
                        setUiNotice(null);
                        setUiNoticeCta(null);
                        openPortal();
                      }}
                      className="px-3 py-2"
                    >
                      Gestisci abbonamento
                    </PrimaryButton>
                  ) : null}

                  <SoftButton
                    onClick={() => {
                      setUiNotice(null);
                      setUiNoticeCta(null);
                    }}
                    className="px-3 py-2"
                  >
                    Chiudi
                  </SoftButton>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'overview' ? (
            <Card className="p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ backgroundImage: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)' }} />

              {!bannerDismissed && banner ? (
                <div className="mt-2 rounded-3xl border border-white/18 bg-white/3 p-4 relative overflow-hidden">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 20% 0%, rgba(34,211,238,0.35), transparent 55%), radial-gradient(circle at 80% 10%, rgba(236,72,153,0.28), transparent 55%)',
                    }}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <BrandMark size={18} />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90">
                          {banner.tone === 'warn' ? 'Billing' : 'Promemoria'}
                        </div>
                        <div className="mt-1 text-[16px] font-extrabold text-white">{banner.title}</div>
                        <div className="mt-1 text-[13px] font-semibold text-white/85">{banner.body}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <PrimaryButton onClick={openPortal}>{banner.cta}</PrimaryButton>
                          <div className="text-[12px] font-semibold text-white/90">Gestisci il piano dal portale Stripe.</div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={dismissBanner}
                      className="relative z-10 rounded-full border border-white/18 bg-white/3 px-3 py-1 text-[12px] font-extrabold text-white hover:bg-white/15"
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
                  {/* ✅ titolo pulito, NO trasparenza */}
                  <div className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">Dashboard</div>

                  <div className="mt-2 text-[13px] text-white/80">
                    {overviewLoading || loadingState
                      ? 'Caricamento dati…'
                      : overviewError
                      ? `Errore: ${overviewError}`
                      : stateError
                      ? `Errore: ${stateError}`
                      : ''}
                  </div>

                {brokerErr && (
                  <div className="mt-3 rounded-2xl border border-amber-300/35 bg-amber-300/15 px-4 py-3 text-[12px] font-semibold text-amber-100">
                    {brokerErr}
                  </div>
                )}

                {brokerMsg && (
                  <div className="mt-3 rounded-2xl border border-white/18 bg-white/3 px-4 py-3 text-[12px] font-semibold text-white/85">
                    {brokerMsg}
                  </div>
                )}


                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Pill label={brokerPill.label} tone={brokerPill.tone} className="px-4 py-2 text-[12px]" />
                  <SoftButton onClick={brokerUx.onClick}>{brokerUx.cta}</SoftButton>
                  {brokerStatus === 'active' && (
                    <SoftButton
                      onClick={submitBrokerDisconnect}
                      disabled={brokerDisconnecting || brokerSubmitting}
                      className="ml-2"
                    >
                      {brokerDisconnecting ? 'Disconnessione…' : 'Disconnetti'}
                    </SoftButton>
                  )}
                  <BigToggle on={autopilot} loading={toggleLoading} disabled={brokerStatus !== 'active'} onToggle={toggleAutopilot} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/18 bg-white/3 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90">Balance</div>
                  <div className="mt-2 text-5xl md:text-6xl font-extrabold tabular-nums text-white">{balance === null ? '—' : balance.toFixed(2)}</div>
                  <div className="mt-1 text-[12px] font-semibold text-white/85">{currency}</div>
                </div>

                <div className="rounded-3xl border border-white/18 bg-white/3 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90">Equity</div>
                  <div className="mt-2 text-5xl md:text-6xl font-extrabold tabular-nums text-white">{equity === null ? '—' : equity.toFixed(2)}</div>
                  <div className="mt-1 text-[12px] font-semibold text-white/85">{currency}</div>
                </div>

                <div className="rounded-3xl border border-white/18 bg-white/3 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90">Open trades</div>
                  <div className="mt-2 text-5xl md:text-6xl font-extrabold tabular-nums text-white">{openTrades === null ? '—' : String(openTrades)}</div>
                  <div className="mt-1 text-[12px] font-semibold text-white/85">live</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/18 bg-white/3 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90">Stile di trading</div>
                      <div className="mt-1 text-[13px] font-semibold text-white/85">Scegli il profilo operativo</div>
                      {aggrErr ? <div className="mt-1 text-[12px] font-semibold text-rose-100">{aggrErr}</div> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={aggrSaving}
                        onClick={() => submitAggressiveness('NORMAL')}
                        className={cx(
                          'rounded-2xl border px-3 py-2 text-[12px] font-extrabold transition',
                          aggr === 'NORMAL' ? 'border-transparent text-white' : 'border-white/18 bg-white/3 text-white hover:bg-white/15'
                        )}
                        style={aggr === 'NORMAL' ? { backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' } : undefined}
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
                        className={cx(
                          'rounded-2xl border px-3 py-2 text-[12px] font-extrabold transition',
                          aggr === 'AGGRESSIVE' ? 'border-transparent text-white' : 'border-white/18 bg-white/3 text-white hover:bg-white/15'
                        )}
                        style={aggr === 'AGGRESSIVE' ? { backgroundImage: 'linear-gradient(135deg, #8b5cf6, #ec4899)' } : undefined}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Aggressive
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/18 bg-white/3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90">Abbonamento</div>
                      <div className="mt-1 text-[13px] font-semibold text-white/85">
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

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[12px] font-semibold text-white/90">
                      Scadenza: <span className="text-white">{formatDateShort(billingStatus?.current_period_end || null)}</span>
                    </div>
                    <PrimaryButton onClick={openPortal} disabled={billingLoading || !billingStatus}>
                      Gestisci abbonamento
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ backgroundImage: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)' }} />
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90">{tradesScope === "history" ? "Trade History" : "Live Trades"}</div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-[12px] text-white/80">{tradesLoading ? 'Caricamento...' : tradesErr ? `Errore: ${tradesErr}` : trades ? `${trades.length} trade(s)` : '—'}</div>
                <SoftButton onClick={() => reloadTrades(tradesScope)} className="px-3 py-2">
                  Ricarica
                </SoftButton>
              </div>

              <div className="mt-4 space-y-3">
                {!trades || trades.length === 0 ? (
                  <div className="rounded-3xl border border-white/18 bg-white/3 p-4 text-[13px] text-white/85">{tradesLoading ? 'Caricamento...' : tradesErr ? `Errore: ${tradesErr}` : (tradesScope === "history" ? "Nessun trade storico ancora." : "Nessun trade ancora.")}</div>
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
                      <div key={key} className="group relative rounded-[2rem] border border-white/18 bg-white/3 p-4">
                        <div className="pointer-events-none absolute -inset-[1px] rounded-[2rem]" style={{ backgroundImage: 'linear-gradient(90deg, rgba(6,182,212,0.22), rgba(139,92,246,0.18), rgba(236,72,153,0.22))' }} />
                        <div
                          className="pointer-events-none absolute inset-0 rounded-[2rem] transition-opacity duration-300"
                          style={{ boxShadow: '0 0 34px -14px rgba(6,182,212,0.40), 0 0 38px -18px rgba(236,72,153,0.40)' }}
                        />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-[18px] font-extrabold tracking-tight bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">{symbol}</div>
                                <span className="rounded-full border border-white/18 bg-white/3 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">{side}</span>
                                <span className="rounded-full border border-white/18 bg-white/3 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">{st}</span>
                              </div>
                              <div className="mt-1 text-[12px] text-white/90">{formatTs(ts0)}</div>

                              {(() => {
                                const w = (t as any)?.why || null;
                                const reasons = w?.reasons ?? null;
                                const origin = (w?.strategy_origin || '').toString().trim();
                                const parts: string[] = [];

                                // reasons può essere array JSONB o stringa
                                if (Array.isArray(reasons)) {
                                  for (const x of reasons) {
                                    const v = (x ?? '').toString().trim();
                                    if (v) parts.push(v);
                                  }
                                } else if (typeof reasons === 'string') {
                                  const v = reasons.trim();
                                  if (v) parts.push(v);
                                }

                                if (!parts.length && !origin) return null;

                                const previewParts = parts.slice(0, 2);
                                const preview = previewParts.join(' • ') + (parts.length > 2 ? ' …' : '');
                                const isOpen = openWhyKey === key;

                                return (
                                  <div className="mt-2">
                                    <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/18 bg-white/3 px-3 py-2 text-[12px] font-semibold text-white/85">
                                      <span className="font-extrabold uppercase tracking-[0.18em] text-white/80">WHY</span>
                                      <span className="break-words">
                                        {preview || '—'}{origin ? ` (${origin})` : ''}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => setOpenWhyKey(isOpen ? null : key)}
                                        className="ml-1 inline-flex items-center justify-center rounded-xl border border-white/18 bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white hover:bg-white/15"
                                        aria-label={isOpen ? 'Chiudi dettagli WHY' : 'Apri dettagli WHY'}
                                        title={isOpen ? 'Chiudi dettagli' : 'Dettagli'}
                                      >
                                        <Info className="h-4 w-4" />
                                      </button>
                                    </div>

                                    {isOpen ? (
                                      <div className="mt-2 rounded-2xl border border-white/18 bg-white/3 p-3 text-[12px] text-white/85">
                                        <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/80">Dettagli WHY</div>
                                        <div className="mt-2 space-y-1">
                                          {origin ? (
                                            <div className="break-words">
                                              <span className="font-extrabold text-white/90">Origine:</span> {origin}
                                            </div>
                                          ) : null}
                                          {parts && parts.length ? (
                                            <div className="break-words">
                                              <span className="font-extrabold text-white/90">Motivi:</span> {parts.join(' • ')}
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="shrink-0 text-right">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">PnL</div>
                              <div
                                className={
                                  'mt-1 text-[16px] font-extrabold ' +
                                  (t.pnl_usdc == null ? 'text-white' : Number(t.pnl_usdc) > 0 ? 'text-emerald-200' : Number(t.pnl_usdc) < 0 ? 'text-rose-200' : 'text-white/85')
                                }
                              >
                                {pnlStr}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="rounded-3xl border border-white/18 bg-white/3 p-3">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">Size</div>
                              <div className="mt-1 text-[13px] font-semibold text-white">{sizeStr}</div>
                            </div>
                            <div className="rounded-3xl border border-white/18 bg-white/3 p-3">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">Entry</div>
                              <div className="mt-1 text-[13px] font-semibold text-white">{entryStr}</div>
                            </div>
                            <div className="rounded-3xl border border-white/18 bg-white/3 p-3">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">Exit</div>
                              <div className="mt-1 text-[13px] font-semibold text-white">{exitStr}</div>
                            </div>
                            <div className="rounded-3xl border border-white/18 bg-white/3 p-3">
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">Stato</div>
                              <div className="mt-1 text-[13px] font-semibold text-white">{st}</div>
                            </div>
                          </div>

                          <div className="mt-4 rounded-[2rem] border border-white/18 bg-white/3 p-4">
                            <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">AI Reasoning</div>
                            <div className="mt-1 text-[12px] text-white/80">
                              Placeholder: qui mostreremo una spiegazione in linguaggio naturale (arriverà dal cervello). Per ora UI pronta.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Broker connect modal */}
      {brokerModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/18 bg-black/35 p-6 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.85)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">Broker</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-white">Collega il tuo conto</div>
                <div className="mt-2 text-[13px] text-white/80">
                  Inserisci i dati del broker. Le credenziali verranno usate solo per collegare il conto tramite MetaApi e non verranno salvate.
                </div>
              </div>

              <SoftButton onClick={() => setBrokerModalOpen(false)} className="px-3 py-2">
                Chiudi
              </SoftButton>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <label className="text-[12px] font-semibold text-white">Piattaforma</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBrokerPlatform('mt5')}
                    className={cx(
                      'flex-1 rounded-2xl border px-4 py-2 text-[12px] font-extrabold',
                      brokerPlatform === 'mt5' ? 'border-transparent text-white' : 'border-white/18 bg-white/3 text-white hover:bg-white/15'
                    )}
                    style={brokerPlatform === 'mt5' ? { backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' } : undefined}
                  >
                    MT5
                  </button>

                  <button
                    type="button"
                    onClick={() => setBrokerPlatform('mt4')}
                    className={cx(
                      'flex-1 rounded-2xl border px-4 py-2 text-[12px] font-extrabold',
                      brokerPlatform === 'mt4' ? 'border-transparent text-white' : 'border-white/18 bg-white/3 text-white hover:bg-white/15'
                    )}
                    style={brokerPlatform === 'mt4' ? { backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' } : undefined}
                  >
                    MT4
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-[12px] font-semibold text-white">Login</label>
                <input
                  value={brokerLogin}
                  onChange={(e) => setBrokerLogin(e.target.value)}
                  placeholder="Es. 12345678"
                  className="rounded-2xl border border-white/18 bg-white/3 px-4 py-3 text-[13px] font-semibold text-white outline-none placeholder:text-white/80 focus:ring-2 focus:ring-cyan-300/35"
                />

                <div className="mt-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/85">Password</div>
                  <input
                    type="password"
                    value={brokerPassword}
                    onChange={(e) => setBrokerPassword(e.target.value)}
                    placeholder="Password broker (one-shot, non salvata)"
                    className="mt-2 w-full rounded-2xl border border-white/18 bg-white/3 px-4 py-3 text-[13px] font-semibold text-white outline-none placeholder:text-white/80 focus:ring-2 focus:ring-fuchsia-300/30"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-[12px] font-semibold text-white">Server</label>
                <input
                  value={brokerServer}
                  onChange={(e) => setBrokerServer(e.target.value)}
                  placeholder="Es. ICMarketsSC-Live"
                  className="rounded-2xl border border-white/18 bg-white/3 px-4 py-3 text-[13px] font-semibold text-white outline-none placeholder:text-white/80 focus:ring-2 focus:ring-violet-300/30"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/18 bg-white/3 p-4">
                <input type="checkbox" checked={brokerConsent} onChange={(e) => setBrokerConsent(e.target.checked)} className="mt-1 h-4 w-4" />
                <div className="text-[12px] text-white/85">
                  <div className="font-semibold">
                    Autorizzo Cerbero a utilizzare queste credenziali solo per collegare il mio conto tramite MetaApi. Le credenziali non verranno salvate.
                  </div>
                  <div className="mt-1 text-white/65">Se la password del broker cambia, la connessione verrà sospesa e dovrai ricollegare il conto.</div>
                </div>
              </label>

              {brokerErr ? <div className="rounded-2xl border border-amber-300/35 bg-amber-300/15 px-4 py-3 text-[12px] font-semibold text-amber-100">{brokerErr}</div> : null}
              {brokerMsg ? <div className="rounded-2xl border border-white/18 bg-white/3 px-4 py-3 text-[12px] font-semibold text-white/85">{brokerMsg}</div> : null}

              <div className="flex gap-3">
                <SoftButton onClick={() => setBrokerModalOpen(false)} className="flex-1 px-4 py-3 text-[13px]">
                  Annulla
                </SoftButton>

                <button
                  type="button"
                  disabled={brokerSubmitting}
                  onClick={submitBrokerConnect}
                  className="flex-1 rounded-2xl border border-transparent px-4 py-3 text-[13px] font-extrabold text-white shadow-sm disabled:"
                  style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)' }}
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
