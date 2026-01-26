'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AccountV2Page() {
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function authHeaders(): HeadersInit {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('cerbero_session') : null;

    const h: Record<string, string> = {};
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  useEffect(() => {
    const loadMe = async () => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('cerbero_session') : null;

      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Mantengo la tua chiamata esistente
      const res = await fetch('/api/me', { headers: { ...authHeaders() } });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        localStorage.removeItem('cerbero_session');
        window.location.href = '/login';
        return;
      }

      setEmail(data.email ?? null);

      // Se il backend li ha, li mostriamo. Altrimenti rimangono "—"
      setFirstName(data.firstName ?? data.name ?? null);
      setLastName(data.lastName ?? data.surname ?? null);
    };

    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 900);
    } catch {
      // noop
    }
  };

  const ShortRow = ({
    label,
    value,
    mono,
    copyKey,
  }: {
    label: string;
    value: string | null;
    mono?: boolean;
    copyKey: string;
  }) => {
    const canCopy = Boolean(value && value !== '—');
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className={`mt-1 text-sm text-slate-900 ${mono ? 'font-mono break-all' : ''}`}>
              {value ?? '—'}
            </p>
          </div>

          {canCopy && (
            <button
              onClick={() => copy(value as string, copyKey)}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {copied === copyKey ? 'Copiato' : 'Copia'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Aurora background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute -top-44 -left-44 h-[44rem] w-[44rem] rounded-full bg-indigo-400/55 blur-[110px]" />
        <div className="absolute top-16 -right-52 h-[46rem] w-[46rem] rounded-full bg-fuchsia-400/45 blur-[120px]" />
        <div className="absolute bottom-[-260px] left-1/3 h-[52rem] w-[52rem] rounded-full bg-sky-400/45 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/0 to-white/25" />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:px-6 lg:py-14">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-20 blur-md" />
              <Image
                src="/branding/cerbero-logo.svg"
                alt="Cerbero AI logo"
                width={40}
                height={40}
                className="relative object-contain"
              />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Account</span>
              <span className="text-sm font-semibold text-slate-900">
                Dati essenziali
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-fit rounded-full border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Torna alla Dashboard
          </Link>
        </div>

        {/* Content */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Profilo</h2>
                <p className="mt-2 text-[12px] text-slate-600">
                  Informazioni minime del tuo account.
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                profile
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <ShortRow label="Nome" value={firstName} copyKey="firstName" />
              <ShortRow label="Cognome" value={lastName} copyKey="lastName" />
              <ShortRow label="Email" value={email} copyKey="email" />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Note</h2>
                <p className="mt-2 text-[12px] text-slate-600">
                  La gestione operativa avviene dalla dashboard.
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                info
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-100 bg-slate-50 p-4">
              <ul className="space-y-2 text-[12px] text-slate-600">
                <li>• Mantieni aggiornata la tua email di iscrizione.</li>
                <li>• Per funzioni e impostazioni, usa la dashboard.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
