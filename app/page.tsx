'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useMemo } from 'react';
import InstallAppSection from '@/components/pwa/InstallAppSection';

/* ----------------------------- helpers ----------------------------- */

const navItems = [
  { id: 'funzionamento', label: 'Come funziona' },
  { id: 'mercati', label: 'Mercati' },
  { id: 'attivazione', label: 'Attivazione' },
  { id: 'prezzo', label: 'Prezzo' },
];

function scrollTo(id: string) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function classNames(...xs: Array<string | undefined | false>) {
  return xs.filter(Boolean).join(' ');
}

/* ----------------------------- UI atoms ----------------------------- */

function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'border border-white/60 bg-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] backdrop-blur-[20px]',
        className
      )}
    >
      {children}
    </div>
  );
}

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'bg-white/85 border border-white/90 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] hover:border-white rounded-[32px]',
        className
      )}
    >
      {children}
    </div>
  );
}

function Pill({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'indigo' | 'emerald' | 'amber' | 'orange' | 'slate';
}) {
  const toneClass =
    tone === 'indigo'
      ? 'border-indigo-100 text-indigo-800 bg-white/50'
      : tone === 'emerald'
      ? 'border-emerald-100 text-emerald-800 bg-white/50'
      : tone === 'amber'
      ? 'border-amber-100 text-amber-800 bg-white/50'
      : tone === 'orange'
      ? 'border-orange-100 text-orange-800 bg-white/50'
      : 'border-slate-200 text-slate-700 bg-white/50';

  return (
    <div
      className={classNames(
        'flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm shadow-sm transition-transform hover:scale-[1.03] cursor-default',
        toneClass
      )}
    >
      {children}
    </div>
  );
}

function Dot({ on }: { on?: boolean }) {
  return (
    <span
      className={classNames(
        'w-1.5 h-1.5 rounded-full',
        on ? 'bg-emerald-500' : 'bg-slate-600'
      )}
    />
  );
}

/* ----------------------------- sections ----------------------------- */

function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      {/* più tono pink/cyan/indigo */}
      <div className="absolute -top-[35%] -left-[15%] h-[980px] w-[980px] rounded-full bg-indigo-200/55 blur-[120px] mix-blend-multiply" />
      <div className="absolute -bottom-[25%] -right-[12%] h-[820px] w-[820px] rounded-full bg-fuchsia-200/55 blur-[120px] mix-blend-multiply" />
      <div className="absolute top-[35%] left-[28%] h-[560px] w-[560px] rounded-full bg-cyan-200/55 blur-[120px] mix-blend-multiply" />
      <div className="absolute top-[10%] right-[18%] h-[420px] w-[420px] rounded-full bg-pink-200/40 blur-[120px] mix-blend-multiply" />
    </div>
  );
}

function AssetTicker() {
  const items = useMemo(
    () => [
      'XAU/USD • SCANNING',
      'NASDAQ • RISK CHECK',
      'EUR/USD • WAITING',
      'OIL (WTI) • FILTERED',
      'GERMANIA40 • SETUP',
      'SPX500 • PAUSED',
      'GBP/JPY • MONITOR',
      'USD/JPY • CONTEXT',
      'SILVER (XAG) • WATCH',
      'VIX • RISK MODE',
    ],
    []
  );

  return (
    <div className="w-full bg-slate-900 overflow-hidden py-3 border-y border-slate-800 relative z-40">
      <div className="flex whitespace-nowrap gap-12 text-xs font-bold text-slate-400 font-mono tracking-widest uppercase animate-[marquee_40s_linear_infinite]">
        {items.concat(items).map((item, i) => {
          const on =
            item.includes('SETUP') || item.includes('SCANNING') || item.includes('RISK CHECK');
          return (
            <span key={i} className="flex items-center gap-2">
              <Dot on={on} />
              {item}
            </span>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50">
      <GlassPanel className="w-full bg-gradient-to-r from-indigo-50/35 via-white/10 to-pink-50/35 border-white/30 shadow-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => scrollTo('top')}
            className="flex items-center gap-3 cursor-pointer group"
            aria-label="Vai in cima"
          >
            {/* logo più visibile + glow */}
            <div className="relative flex h-11 w-11 items-center justify-center">
              <div
                className="absolute inset-0 rounded-2xl opacity-95 shadow-lg"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
                }}
              />
              <div className="absolute -inset-2 rounded-3xl bg-indigo-400/20 blur-[14px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85 ring-1 ring-white/70">
                <Image
                  src="/branding/cerbero-logo.svg"
                  alt="Cerbero AI logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Cerbero.AI in gradient */}
            <span className="font-extrabold text-xl tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Cerbero.AI
              </span>
            </span>
          </button>

          <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
            {navItems.map((it) => (
              <button
                key={it.id}
                onClick={() => scrollTo(it.id)}
                className="hover:text-indigo-600 transition"
              >
                {it.label}
              </button>
            ))}
          </div>

          {/* Right actions: Registrazione + Login */}
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="hidden sm:inline-flex bg-white text-slate-800 px-5 py-2.5 rounded-full text-sm font-bold border border-slate-200 hover:bg-slate-50 transition shadow-sm active:scale-95"
            >
              Registrazione
            </Link>

            <Link
              href="/login"
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 active:scale-95"
            >
              Login
            </Link>
          </div>
        </div>
      </GlassPanel>
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center relative"
    >
      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
        <span className="relative inline-block"><span className="absolute -inset-x-4 -inset-y-2 rounded-full bg-gradient-to-r from-cyan-400/25 via-fuchsia-400/25 to-indigo-400/25 blur-2xl" aria-hidden="true" /><span className="relative bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(236,72,153,0.35)]">Cerbero:</span></span>
        <br />
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Agent per il Trading
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        Trading automatico su <strong>Forex</strong>, <strong>Indici</strong> e{' '}
        <strong>Materie Prime</strong>. Controllo fondi sempre tuo. Nessuna % sui
        profitti: solo <strong>canone mensile</strong>.
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-18">
        <Link
          href="/signup"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          Collega conto broker
        </Link>
        <button
          onClick={() => scrollTo('funzionamento')}
          className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition"
        >
          Scopri il nostro AI Agent
        </button>
      </div>

      {/* Video placeholder */}
      <div className="max-w-5xl mx-auto mb-16 relative group">
        <div className="absolute inset-0 bg-fuchsia-500 blur-[70px] opacity-15 rounded-full group-hover:opacity-25 transition-opacity duration-500" />

        <GlassPanel className="relative rounded-[32px] overflow-hidden border border-white/50 shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)]">
          {/* 16:9 desktop */}
          <div className="relative hidden md:block aspect-video">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src="/videos/hero-16-9.mp4" type="video/mp4" />
            </video>
          </div>

          {/* 9:16 mobile */}
          <div className="relative md:hidden aspect-[9/12]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src="/videos/hero-9-16.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Overlay CTA */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <span className="text-white text-3xl translate-x-[1px]">▶</span>
              </div>
              <p className="text-white/85 font-bold tracking-widest text-xs uppercase">
                Guarda Cerbero in azione
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Concept card */}
      <GlassPanel className="max-w-3xl mx-auto p-8 rounded-[32px] border border-white/60 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-end mb-6">
          <div className="text-left">
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
              Disciplina & rischio
            </div>
            <div className="text-2xl font-bold text-slate-900">
              Prima protezione, poi performance
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
              Attivo
            </div>
          </div>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 mb-8 opacity-90 px-4">
          {[10, 12, 15, 14, 18, 22, 26, 30, 35, 42, 50, 60, 72, 85, 100].map(
            (h, i) => (
              <div
                key={i}
                className="w-full bg-gradient-to-t from-indigo-300 to-indigo-600 rounded-t-md hover:opacity-100 transition-opacity"
                style={{ height: `${h}%`, opacity: 0.55 + i * 0.025 }}
              />
            )
          )}
        </div>

        <div className="pt-6 border-t border-slate-200/60 text-center">
          <p className="text-sm text-slate-500 italic font-medium">
            “La prima regola è sopravvivere. La seconda è non dimenticare la prima.”
          </p>
          <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">
            — Principio di gestione del rischio
          </p>
        </div>
      </GlassPanel>
    </section>
  );
}

function ThreeHeads() {
  return (
    <section id="funzionamento" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          Come prende decisioni Cerbero
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed">
          Ogni operazione deve passare tre controlli.{' '}
          <strong>Se uno blocca, Cerbero si ferma.</strong>
        </p>
        <p className="mt-3 text-xs text-slate-400 font-semibold">
          Metodologie ispirate a Smart Money / ICT (non come focus “retail”).
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <GlassCard className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
            📈
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">L’Analista</h3>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
            Struttura & liquidità
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Legge struttura e liquidità: entra dove c’è un vantaggio reale, non a caso.
          </p>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
            🌍
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Il Gestore</h3>
          <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-4">
            Contesto & macro
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Controlla il contesto: sessioni, volatilità e news ad alto impatto. Se serve, mette in pausa.
          </p>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
            🛡️
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Il Garante</h3>
          <p className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-4">
            Matematica & rischio
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Decide quanto rischiare: protegge il capitale e limita l’esposizione.
          </p>
        </GlassCard>
      </div>
    </section>
  );
}

function Markets() {
  const forex = [
    'EUR/USD',
    'GBP/USD',
    'USD/JPY',
    'AUD/USD',
    'USD/CAD',
    'USD/CHF',
    'AUD/JPY',
    'GBP/JPY',
    'CAD/JPY',
    'EUR/JPY',
  ];
  const indices = ['NASDAQ', 'USA 500', 'GERMANIA40', 'NIKKEI225'];
  const commodities = ['GOLD (XAU)', 'SILVER (XAG)', 'OIL (WTI)'];

  return (
    <section id="mercati" className="py-20 px-6 max-w-7xl mx-auto">
      <GlassPanel className="rounded-[40px] p-10 md:p-16 border border-white/60 relative overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
              Dove opera il nostro AI Agent
            </span>
          </h2>
          <p className="text-slate-500">
            Solo mercati tradizionali su MT5. <strong>Nessuna crypto.</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-700">
              <span className="text-lg">🌍</span>
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Forex
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {forex.map((s) => (
                <Pill key={s} tone="indigo">
                  <span className="text-xs font-bold">{s}</span>
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <span className="text-lg">🏙️</span>
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Indici
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {indices.map((s) => (
                <Pill key={s} tone="emerald">
                  <span className="text-xs font-bold">{s}</span>
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 text-amber-600">
              <span className="text-lg">⛽</span>
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Materie prime
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {commodities.map((s) => (
                <Pill key={s} tone="amber">
                  <span className="text-xs font-bold">{s}</span>
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
            Azioni (Stocks) in fase di sviluppo… Coming soon
          </span>
        </div>
      </GlassPanel>
    </section>
  );
}

function OnboardingSteps() {
  return (
    <section id="attivazione" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Attivazione semplice.
        </h2>
        <p className="text-slate-500">
          Niente configurazioni complesse. Bastano 3 passaggi.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="relative group">
          <GlassCard className="p-10 rounded-[40px] text-center h-full">
            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center text-3xl text-indigo-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
              👤
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              1. Crea account
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Registrati alla dashboard ufficiale di Cerbero AI e attiva il piano.
            </p>
          </GlassCard>
          <div className="absolute top-1/2 -right-6 w-12 h-0.5 bg-slate-200 hidden md:block" />
        </div>

        <div className="relative group">
          <GlassCard className="p-10 rounded-[40px] text-center h-full border-indigo-200 shadow-xl">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
              🔌
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              2. Collega conto broker
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Collega un conto broker compatibile con MetaTrader 5 (o MetaTrader 4). Connessione criptata via MetaApi.
            </p>
          </GlassCard>
          <div className="absolute top-1/2 -right-6 w-12 h-0.5 bg-slate-200 hidden md:block" />
        </div>

        <div className="relative group">
          <GlassCard className="p-10 rounded-[40px] text-center h-full">
            <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-3xl text-emerald-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              3. Attiva Autopilot
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Accendi l’interruttore. Cerbero opera entro i limiti di rischio e può mettersi in pausa se necessario.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function TrustCenter() {
  return (
    <section className="py-24 px-6 bg-slate-900 text-white rounded-[3rem] max-w-7xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-fuchsia-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-cyan-500/15 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">
          I tuoi fondi restano sul broker.
        </h2>
        <p className="text-slate-400 mb-12 text-lg">
          Cerbero è un software: automatizza l’esecuzione sul tuo MT5. Non custodiamo denaro e non possiamo prelevare.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-400">🔒</span> Sicurezza dei fondi
            </h4>
            <p className="text-sm text-slate-400">
              I capitali rimangono sul tuo conto MT5. Cerbero ha solo permessi operativi (apertura/chiusura posizioni),
              nessuna possibilità di prelievo.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-400">📊</span> Canone fisso
            </h4>
            <p className="text-sm text-slate-400">
              Modello SaaS a canone mensile. 0% commissioni sui profitti e nessun incentivo a “spingere” rischio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="prezzo" className="py-24 px-6 max-w-4xl mx-auto text-center">
      <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">
        Piano
      </div>
      <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
        Tecnologia avanzata.
        <br />
        senza complicazioni.
      </h2>

      <GlassPanel className="p-10 md:p-14 rounded-[3rem] mt-12 shadow-2xl border border-white/60 relative overflow-hidden bg-gradient-to-br from-white/90 to-indigo-50/50">
        <div className="relative z-10">
          <div className="inline-block px-4 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase mb-6">
            Canone mensile
          </div>

          <div className="text-7xl font-extrabold text-slate-900 mb-2 tracking-tight">
            99€<span className="text-xl text-slate-500 font-medium tracking-normal">/mese</span>
          </div>

          <p className="text-slate-500 mb-10">
            Tutto incluso. Nessuna percentuale sui tuoi guadagni.
          </p>

          <div className="flex flex-col gap-4 max-w-sm mx-auto mb-10 text-left">
            {[
              'Autotrading su Forex, Indici e Materie Prime',
              'Collegamento MT5 (broker compatibili)',
              '0% commissioni sui profitti',
            ].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span className="text-sm font-medium text-slate-700">{t}</span>
              </div>
            ))}
          </div>

          <Link
            href="/signup"
            className="w-full md:w-auto inline-flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-800 text-white px-12 py-5 rounded-2xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            Inizia ora
          </Link>

          <p className="mt-6 text-xs text-slate-400">
            Disdici in qualsiasi momento. Pagamento sicuro via Stripe.
          </p>
        </div>
      </GlassPanel>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              {/* logo footer coerente con header */}
              <div className="relative flex h-11 w-11 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-2xl opacity-95 shadow-lg"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
                  }}
                />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85 ring-1 ring-white/70">
                  <Image
                    src="/branding/cerbero-logo.svg"
                    alt="Cerbero AI logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>

              <span className="font-extrabold text-xl block">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Cerbero.AI
                </span>
              </span>
            </div>

            <p className="text-sm text-slate-500 max-w-xs mx-auto md:mx-0">
              Software (SaaS) per l’automazione dell’esecuzione su conti MT5 via MetaApi.
              L’utente mantiene controllo e responsabilità dei fondi.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Contatti</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Supporto</li>
              <li>info@cerberoai.com</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Legale</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link href="/legal/privacy" className="hover:text-indigo-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-indigo-600 transition">
                  Termini &amp; Rischi
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-indigo-600 transition">
                  Cookie
                </Link>
              </li>
              <li>
                <Link href="/legal/official" className="hover:text-indigo-600 transition">
                  Documento Ufficiale
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed">
          <p>
            DISCLAIMER: Cerbero AI non offre consulenza finanziaria personalizzata. Il servizio è fornito esclusivamente
            come infrastruttura tecnologica (SaaS) per l’automazione dell’esecuzione su conti MT5. Il trading comporta
            rischi significativi e può comportare la perdita del capitale. Le performance passate non sono garanzia di
            risultati futuri.
          </p>
          <p className="mt-2 text-center md:text-left">© {new Date().getFullYear()} Cerbero AI</p>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- page ----------------------------- */

export default function HomePage() {
  return (
    <div className="font-sans antialiased selection:bg-indigo-500 selection:text-white text-slate-900">
      <AuroraBackground />
      <AssetTicker />
      <Navbar />

      <main className="relative">
        <Hero />
        <ThreeHeads />
        <Markets />
        <OnboardingSteps />
        <TrustCenter />
        <Pricing />
        <InstallAppSection />
        <Footer />
      </main>
    </div>
  );
}
