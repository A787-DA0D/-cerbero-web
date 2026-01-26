'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

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

function formatNumber(n: number, decimals = 2) {
  return n.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ------------------------------ PAGE ------------------------------ */

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Redirect client-side (semplice e robusto)
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  // UI state CeFi (placeholder)
  const [cefiConnected, setCefiConnected] = useState(false);
  const [cefiBalanceEur, setCefiBalanceEur] = useState<number>(0);
  const [autopilotOn, setAutopilotOn] = useState(false);

  const userEmail = session?.user?.email ?? null;

  const channelStatus = useMemo(() => {
    const hasBalance = (cefiBalanceEur ?? 0) > 0 || cefiConnected;
    const executionEnabled = cefiConnected;
    const autopilot = autopilotOn;

    if (!hasBalance) return { label: 'Non operativo', reason: 'Manca: saldo / capitale', ok: false };
    if (!executionEnabled) return { label: 'Parzialmente operativo', reason: 'Manca: connessione broker', ok: false };
    if (!autopilot) return { label: 'Pronto', reason: 'Autopilot disattivato', ok: true };
    return { label: 'Operativo', reason: 'Sistema attivo', ok: true };
  }, [cefiBalanceEur, cefiConnected, autopilotOn]);

  // (Fix Python -> TS booleans)
  // We'll patch these immediately below after write.

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Luminous / Aurora background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute -top-44 -left-44 h-[620px] w-[620px] rounded-full bg-indigo-300/55 blur-[110px] mix-blend-multiply" />
        <div className="absolute top-1/4 -right-52 h-[680px] w-[680px] rounded-full bg-fuchsia-300/40 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-260px] left-1/3 h-[760px] w-[760px] rounded-full bg-sky-300/40 blur-[130px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_20%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_62%,rgba(255,255,255,0.85)_100%)]" />
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:px-6 lg:py-14">
        {/* Top bar */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
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
                Email: <span className="font-mono text-slate-700">{userEmail ?? '—'}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={autopilotOn ? 'ok' : 'warn'}>
              {autopilotOn ? 'Autopilot attivo' : 'Autopilot disattivato'}
            </Pill>
            <Pill>Broker MT5 · CeFi</Pill>

            <Link
              href="/account"
              className="ml-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
            >
              Account
            </Link>

            <SecondaryButton
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Logout
            </SecondaryButton>
          </div>
        </section>

        {/* KPI Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Saldo</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatNumber(cefiBalanceEur, 2)} €
              </span>
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-500">Broker balance (placeholder)</div>
          </Card>

          <Card className="p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Stato canale</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                {channelStatus.label}
              </span>
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-500">{channelStatus.reason}</div>
          </Card>

          <Card className="p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Autopilot</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {autopilotOn ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="mt-3">
              <PrimaryButton
                onClick={() => setAutopilotOn(v => !v)}
                className="w-full"
                disabled={!cefiConnected}
              >
                {cefiConnected ? (autopilotOn ? 'Disattiva' : 'Attiva') : 'Collega broker prima'}
              </PrimaryButton>
            </div>
          </Card>
        </div>

        {/* Main card */}
        <Card className="p-6">
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
              <Pill tone={cefiConnected ? 'ok' : 'warn'}>
                {cefiConnected ? 'Broker collegato' : 'Broker non collegato'}
              </Pill>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Connessione broker (placeholder)
              </div>

              <div className="mt-4 grid gap-2">
                <PrimaryButton
                  onClick={() => setCefiConnected(true)}
                  className="w-full"
                >
                  Simula “Broker collegato”
                </PrimaryButton>

                <SecondaryButton
                  onClick={() => { setCefiConnected(false); setAutopilotOn(false); }}
                  className="w-full"
                >
                  Disconnetti
                </SecondaryButton>
              </div>

              <p className="mt-3 text-[12px] font-semibold text-slate-500">
                Nota: qui collegheremo MetaApi quando agganciamo il backend CeFi reale.
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
                  <span className={`h-2 w-2 rounded-full ${autopilotOn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>{autopilotOn ? 'Autopilot attivo' : 'Attiva autopilot (quando disponibile)'}</span>
                </li>
              </ul>
            </Card>
          </div>
        </Card>
      </main>
    </div>
  );
}
