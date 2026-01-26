#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
from datetime import datetime

TARGET = Path("app/dashboard/DashboardClient.tsx")
STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

CONTENT = r"""'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur-xl ${className}`}>
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

/* ------------------------------ COMPONENT ------------------------------ */

type DashboardClientProps = {
  initialEmail: string;
};

export default function DashboardClient({ initialEmail }: DashboardClientProps) {
  const { data: session, status } = useSession();

  // Redirect client-side (semplice e robusto)
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  const email = (session?.user?.email || initialEmail || '').toString();

  // UI state CeFi (placeholder)
  const [cefiConnected, setCefiConnected] = useState(false);
  const [cefiBalanceEur, setCefiBalanceEur] = useState<number>(0);
  const [autopilotOn, setAutopilotOn] = useState(false);

  const headerStatus = useMemo(() => {
    if (status === 'loading') return { label: 'Loading', tone: 'neutral' as const };
    if (!email) return { label: 'No session', tone: 'warn' as const };
    return { label: 'Session OK', tone: 'ok' as const };
  }, [status, email]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {/* Top bar */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/branding/cerbero-logo.svg" alt="Cerbero AI" width={34} height={34} />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">Dashboard</div>
              <div className="text-[12px] font-semibold text-slate-500">{email || '...'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Pill tone={headerStatus.tone}>{headerStatus.label}</Pill>
            <SecondaryButton
              onClick={() => signOut({ callbackUrl: '/login' })}
              disabled={status !== 'authenticated'}
            >
              Logout
            </SecondaryButton>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">CeFi</div>
                <div className="mt-1 text-xl font-extrabold">Stato Connessione</div>
              </div>

              <Pill tone={cefiConnected ? 'ok' : 'warn'}>
                {cefiConnected ? 'Connesso' : 'Non connesso'}
              </Pill>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Balance (EUR)</div>
                <div className="mt-2 text-2xl font-extrabold">{formatNumber(cefiBalanceEur, 2)}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Autopilot</div>
                <div className="mt-2 flex items-center gap-3">
                  <Pill tone={autopilotOn ? 'ok' : 'warn'}>{autopilotOn ? 'ON' : 'OFF'}</Pill>
                  <SecondaryButton onClick={() => setAutopilotOn((x) => !x)}>
                    Toggle
                  </SecondaryButton>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => setCefiConnected(true)}>Simula Connect</PrimaryButton>
              <SecondaryButton onClick={() => setCefiBalanceEur(1250.55)}>Simula Balance</SecondaryButton>
              <SecondaryButton onClick={() => setCefiConnected(false)}>Reset</SecondaryButton>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Quick Links</div>
            <div className="mt-4 flex flex-col gap-3">
              <Link className="text-sm font-semibold text-indigo-700 hover:underline" href="/">
                ← Torna al sito
              </Link>
              <Link className="text-sm font-semibold text-slate-700 hover:underline" href="/signup">
                /signup
              </Link>
              <Link className="text-sm font-semibold text-slate-700 hover:underline" href="/login">
                /login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
"""

def main():
  if TARGET.exists():
    bak = TARGET.with_suffix(TARGET.suffix + f".bak_{STAMP}")
    bak.write_text(TARGET.read_text(encoding="utf-8"), encoding="utf-8")
    print(f"📦 Backup: {bak}")
  else:
    TARGET.parent.mkdir(parents=True, exist_ok=True)

  TARGET.write_text(CONTENT.rstrip() + "\n", encoding="utf-8")
  print("✅ DashboardClient.tsx riscritto correttamente (props initialEmail incluse).")

if __name__ == "__main__":
  main()
