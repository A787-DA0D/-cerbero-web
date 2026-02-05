'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

type TabKey = 'overview' | 'trades' | 'activity' | 'profile';

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(' ');
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
  const [toggleLoading, setToggleLoading] = useState(false);

  const [firstName, setFirstName] = useState<string>('—');
  const [lastName, setLastName] = useState<string>('—');

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login';
  }, [status]);

  // carica stato conto SOLO quando sei autenticato
  useEffect(() => {
    if (status !== 'authenticated') return;

    const load = async () => {
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

    load();
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
  const brokerConnected = brokerStatus === 'active';
  const brokerPill = brokerConnected ? { label: 'Broker: Connesso', tone: 'ok' as const } : { label: 'Broker: Non connesso', tone: 'warn' as const };

  const currency = accountState?.account?.currency || 'EUR';
  const balance = accountState?.account?.balance ?? null;
  const equity = accountState?.account?.equity ?? null;

  const toggleAutopilot = async (next: boolean) => {
    setToggleLoading(true);
    try {
      const res = await fetch('/api/autopilot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
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
                    <div className="mt-2 text-3xl font-extrabold tabular-nums">—</div>
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

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <span className="text-[12px] font-semibold text-slate-700">Broker</span>
                  {accountState?.broker?.status === 'active' ? (
                    <Pill label="Connesso" tone="ok" />
                  ) : (
                    <Pill label="Non connesso" tone="warn" />
                  )}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <span className="text-[12px] font-semibold text-slate-700">Last sync</span>
                  <Pill
                    label={accountState?.account?.updated_at ? new Date(accountState.account.updated_at).toLocaleString() : '—'}
                    tone="neutral"
                  />
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
      </div>
    </div>
  );
}
