'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  className = '',
  type = 'button',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:translate-y-[-1px] hover:brightness-110 disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
      style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)' }}
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') window.location.href = '/dashboard';
  }, [status]);

  const hint = useMemo(() => {
    if (!sentTo) return null;
    return `✅ Email inviata a ${sentTo}. Controlla posta e spam.`;
  }, [sentTo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSentTo(null);

    const v = email.trim().toLowerCase();
    if (!v || !v.includes('@')) {
      setErr('Inserisci una email valida.');
      return;
    }

    setIsSending(true);
    try {
      // 1) Pre-check: se NON è tenant -> redirect a signup (senza inviare email login)
      const chk = await fetch(`/api/tenant/exists?email=${encodeURIComponent(v)}`, {
        method: 'GET',
        headers: { 'cache-control': 'no-store' },
      });

      const chkData = await chk.json().catch(() => null);

      if (!chk.ok || !chkData?.ok) {
        throw new Error('Errore verifica email. Riprova.');
      }

      if (!chkData.exists) {
        window.location.href = `/signup?email=${encodeURIComponent(v)}`;
        return;
      }

      // 2) È tenant -> invio email login
      const res = await signIn('email', {
        email: v,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (res?.error) {
        setErr('Errore invio email. Controlla configurazione server email e riprova.');
        return;
      }

      setSentTo(v);
    } catch (e: any) {
      setErr(e?.message || 'Errore inatteso.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900" />
        <div className="absolute -top-44 -left-44 h-[620px] w-[620px] rounded-full bg-indigo-500/70 blur-[110px] mix-blend-multiply" />
        <div className="absolute top-1/4 -right-52 h-[680px] w-[680px] rounded-full bg-fuchsia-500/70 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-260px] left-1/3 h-[760px] w-[760px] rounded-full bg-cyan-500/70 blur-[130px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_20%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.18)_55%,rgba(255,255,255,0.35)_100%)]" />
      </div>

      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 lg:px-6 lg:py-14">
        <Card className="w-full max-w-md p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div
                className="absolute inset-0 rounded-2xl opacity-90 shadow-lg"
                style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)' }}
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
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Cerbero</span>
              <span className="text-sm font-semibold text-slate-800">
                Accedi alla tua{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </span>
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Accedi a Cerbero AI</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Inserisci la tua email: ti inviamo un link sicuro per entrare.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci la tua email"
              autoComplete="email"
            />

            <PrimaryButton type="submit" disabled={isSending}>
              {isSending ? 'Invio…' : 'Invia link di accesso'}
            </PrimaryButton>

            {err && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12px] font-semibold text-rose-800">
                {err}
              </div>
            )}

            {hint && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12px] font-semibold text-emerald-800">
                {hint}
              </div>
            )}
          </form>

          <div className="mt-6 text-[12px] font-semibold text-slate-500">
            Problemi? Controlla lo spam oppure riprova tra 1 minuto.
          </div>
        </Card>
      </main>
    </div>
  );
}
