'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useMemo } from 'react';

/* ----------------------------- helpers ----------------------------- */

const navItems = [
  { id: 'filosofia', label: 'Filosofia' },
  { id: 'matrix', label: 'Matrix Asset' },
  { id: 'onboarding', label: 'Come Iniziare' },
  { id: 'pricing', label: 'Pricing' },
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
      <div className="absolute -top-[30%] -left-[10%] h-[900px] w-[900px] rounded-full bg-indigo-200/40 blur-[120px] mix-blend-multiply" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[700px] w-[700px] rounded-full bg-fuchsia-100/45 blur-[120px] mix-blend-multiply" />
      <div className="absolute top-[40%] left-[30%] h-[500px] w-[500px] rounded-full bg-cyan-100/45 blur-[120px] mix-blend-multiply" />
    </div>
  );
}

function AssetTicker() {
  const items = useMemo(
    () => [
      'GOLD (XAU) • LONG',
      'BTC/USD • ACCUMULO',
      'NASDAQ • HEDGING',
      'EUR/USD • NEUTRAL',
      'OIL (WTI) • SHORT',
      'ETH/USD • SCANNING',
      'GERMANIA40 • LONG',
      'SPX500 • WAITING',
      'NIKKEI225 • VOLATILE',
      'GBP/JPY • TARGET HIT',
    ],
    []
  );

  return (
    <div className="w-full bg-slate-900 overflow-hidden py-3 border-y border-slate-800 relative z-40">
      <div className="flex whitespace-nowrap gap-12 text-xs font-bold text-slate-400 font-mono tracking-widest uppercase animate-[marquee_40s_linear_infinite]">
        {items.concat(items).map((item, i) => {
          const on = item.includes('LONG') || item.includes('TARGET');
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
            className="flex items-center gap-2 cursor-pointer group"
            aria-label="Vai in cima"
          >
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
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Cerbero<span className="text-indigo-600">.AI</span>
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

          <Link
            href="/login"
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 active:scale-95"
          >
            Accesso Dashboard
          </Link>
        </div>
      </GlassPanel>
    </nav>
  );
}

function Hero() {
  return (
    <section id="top" className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center relative">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
        Protocollo di Accumulo Istituzionale
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
        Trasforma il tuo conto MT5
        <br />
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          in un Hedge Fund.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        L’infrastruttura neurale che si collega direttamente al tuo broker.
        <strong> 20 modelli</strong> lavorano simultaneamente sul tuo conto per generare alpha.
        Tu mantieni i fondi, noi forniamo l’esecuzione.
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-20">
        <Link
          href="/signup"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          Collega Broker
        </Link>
        <button
          onClick={() => scrollTo('filosofia')}
          className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition"
        >
          Scopri la Tecnologia
        </button>
      </div>

      
      {/* Video placeholder */}
      <div className="max-w-5xl mx-auto mb-16 relative group">
        <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500" />

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

          {/* Overlay CTA (NO patina scura) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <span className="text-white text-3xl translate-x-[1px]">▶</span>
              </div>
              <p className="text-white/80 font-bold tracking-widest text-xs uppercase">
                Guarda Cerbero in Azione
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
              Interesse Composto
            </div>
            <div className="text-2xl font-bold text-slate-900">
              La Potenza della Crescita Esponenziale
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
              Attivo
            </div>
          </div>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 mb-8 opacity-90 px-4">
          {[10, 12, 15, 14, 18, 22, 26, 30, 35, 42, 50, 60, 72, 85, 100].map((h, i) => (
            <div
              key={i}
              className="w-full bg-gradient-to-t from-indigo-300 to-indigo-600 rounded-t-md hover:opacity-100 transition-opacity"
              style={{ height: `${h}%`, opacity: 0.6 + i * 0.03 }}
            />
          ))}
        </div>

        <div className="pt-6 border-t border-slate-200/60 text-center">
          <p className="text-sm text-slate-500 italic font-medium">
            “L’interesse composto è l’ottava meraviglia del mondo.”
          </p>
          <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">— Albert Einstein</p>
        </div>
      </GlassPanel>
    </section>
  );
}

function ThreeHeads() {
  return (
    <section id="filosofia" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
          Coscienza: Il Consenso a 3 Teste
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed">
          Cerbero usa logiche istituzionali <strong>SMC (Smart Money Concepts)</strong> e <strong>ICT</strong> per
          leggere struttura e liquidità, con un risk engine che ha diritto di veto.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <GlassCard className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
            <i className="ph-fill ph-trend-up"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">L’Analista</h3>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
            Struttura & Liquidità (SMC)
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Scansiona order blocks e zone di liquidità. Non guarda “indicatori retail”: guarda dove si muovono i grandi
            player.
          </p>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
            🌍
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Il Gestore</h3>
          <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-4">Contesto & Macro</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Analizza sessioni (Londra/NY) e contesto macro. Se c’è volatilità anomala o news ad alto impatto,
            <strong> blocca l’operatività</strong>.
          </p>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-2xl mb-6 shadow-sm">
            <i className="ph-fill ph-shield-check"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Il Garante</h3>
          <p className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-4">Matematica & Rischio</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Calcola size e rischio in base al capitale. La regola: prima proteggere il capitale, poi cercare profitto.
          </p>
        </GlassCard>
      </div>
    </section>
  );
}

function AssetMatrix() {
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
  const crypto = ['BTC/USD', 'ETH/USD'];
  const indices = ['NASDAQ', 'USA 500', 'USATECH', 'GERMANIA40', 'NIKKEI225'];
  const commodities = ['GOLD (XAU)', 'SILVER (XAG)', 'OIL (WTI)'];

  return (
    <section id="matrix" className="py-20 px-6 max-w-7xl mx-auto">
      <GlassPanel className="rounded-[40px] p-10 md:p-16 border border-white/60 relative overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
              20 Modelli Neurali.
            </span>{' '}
            20 Asset.
          </h2>
          <p className="text-slate-500">
            Portafoglio diversificato gestito automaticamente. Ogni asset ha la sua rete neurale dedicata.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-700">
              <span className="text-lg"><i className="ph-fill ph-globe-hemisphere-west"></i></span>
              <h4 className="font-bold text-sm uppercase tracking-wider">Forex Majors</h4>
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
              <h4 className="font-bold text-sm uppercase tracking-wider">Indici Globali</h4>
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
              <h4 className="font-bold text-sm uppercase tracking-wider">Materie Prime</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {commodities.map((s) => (
                <Pill key={s} tone="amber">
                  <span className="text-xs font-bold">{s}</span>
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 text-orange-600">
              <span className="text-lg">₿</span>
              <h4 className="font-bold text-sm uppercase tracking-wider">Crypto Blue Chips</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {crypto.map((s) => (
                <Pill key={s} tone="orange">
                  <span className="text-xs font-bold">{s}</span>
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
            Stocks (Azioni) in fase di apprendimento… Coming Soon
          </span>
        </div>
      </GlassPanel>
    </section>
  );
}

function OnboardingSteps() {
  return (
    <section id="onboarding" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Attivazione Rapida.</h2>
        <p className="text-slate-500">Niente configurazioni complesse. Bastano 3 passaggi.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="relative group">
          <GlassCard className="p-10 rounded-[40px] text-center h-full">
            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center text-3xl text-indigo-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
              👤
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">1. Crea Account</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Registrati alla dashboard ufficiale di Cerbero AI e attiva l’abbonamento.
            </p>
          </GlassCard>
          <div className="absolute top-1/2 -right-6 w-12 h-0.5 bg-slate-200 hidden md:block" />
        </div>

        <div className="relative group">
          <GlassCard className="p-10 rounded-[40px] text-center h-full border-indigo-200 shadow-xl">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <i className="ph-fill ph-plug"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">2. Collega MT5</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Inserisci le credenziali del tuo broker. Connessione criptata via MetaApi.
            </p>
          </GlassCard>
          <div className="absolute top-1/2 -right-6 w-12 h-0.5 bg-slate-200 hidden md:block" />
        </div>

        <div className="relative group">
          <GlassCard className="p-10 rounded-[40px] text-center h-full">
            <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-3xl text-emerald-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <i className="ph-fill ph-rocket-launch"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">3. Start Autopilot</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Attiva l’interruttore. Cerbero gestisce l’operatività 24/7 entro i limiti di rischio.
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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Non-Custodial. Per Davvero.</h2>
        <p className="text-slate-400 mb-12 text-lg">
          A differenza di fondi o piattaforme che “trattengono capitale”, noi non tocchiamo mai i tuoi soldi.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-400">🔒</span> Fondi al Sicuro
            </h4>
            <p className="text-sm text-slate-400">
              I capitali rimangono sul tuo broker MT5. Cerbero ha solo permessi operativi (apertura/chiusura posizioni),
              nessuna possibilità di prelievo.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-400">📊</span> Allineamento Totale
            </h4>
            <p className="text-sm text-slate-400">
              Siamo un software SaaS a canone fisso. 0% commissioni sui profitti e nessun incentivo a “spingere” rischio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 max-w-4xl mx-auto text-center">
      <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Membership</div>
      <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
        Tecnologia Hedge Fund.
        <br />
        a portata di mano.
      </h2>

      <GlassPanel className="p-10 md:p-14 rounded-[3rem] mt-12 shadow-2xl border border-white/60 relative overflow-hidden bg-gradient-to-br from-white/90 to-indigo-50/50">
        <div className="relative z-10">
          <div className="inline-block px-4 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase mb-6">
            Flat Fee
          </div>

          <div className="text-7xl font-extrabold text-slate-900 mb-2 tracking-tight">
            99€<span className="text-xl text-slate-500 font-medium tracking-normal">/mese</span>
          </div>

          <p className="text-slate-500 mb-10">Tutto incluso. Nessuna percentuale sui tuoi guadagni.</p>

          <div className="flex flex-col gap-4 max-w-sm mx-auto mb-10 text-left">
            {[
              'Autotrading 24/7 su 20 Asset',
              'Collegamento MT5 (qualsiasi Broker compatibile)',
              '0% Commissioni sui Profitti',
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
            Attiva il Protocollo
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
              <span className="font-bold text-xl text-slate-900 block">Cerbero<span className="text-indigo-600">.AI</span></span>
            </div>

            <p className="text-sm text-slate-500 max-w-xs mx-auto md:mx-0">
              Software (SaaS) per l’automazione dell’esecuzione su piattaforme MT5. L’utente mantiene controllo e
              responsabilità dei fondi.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Contatti</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Supporto Tecnico</li>
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
                  Termini di Servizio
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-indigo-600 transition">
                  Cookie
                </Link>
              </li>
              <li>
                <Link href="/legal/risk" className="hover:text-indigo-600 transition">
                  Risk Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed">
          <p>
            DISCLAIMER: Cerbero AI non offre consulenza finanziaria personalizzata. Il servizio è fornito esclusivamente
            come infrastruttura tecnologica (SaaS) per l’automazione dell’esecuzione. Il trading comporta rischi
            significativi e può comportare la perdita del capitale. Le performance passate non sono garanzia di risultati
            futuri.
          </p>
          <p className="mt-2 text-center md:text-left">© {new Date().getFullYear()} Cerbero Technologies S.r.l.</p>
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
        <AssetMatrix />
        <OnboardingSteps />
        <TrustCenter />
        <Pricing />
        <Footer />
      </main>
    </div>
  );
}
