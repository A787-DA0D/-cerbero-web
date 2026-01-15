'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

/* --------------------------------- NAV --------------------------------- */

const navItems = [
  { id: 'protocollo', label: 'PROTOCOLLO' },
  { id: 'pricing', label: 'PRICING' },
  { id: 'controllo', label: 'CONTROLLO' },
  { id: 'coming', label: 'COMING NEXT' },
];

function scrollToSection(id: string) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* -------------------------------- VARIANTS ------------------------------- */

const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sectionContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

/* ---------------------------- AURORA BACKDROP ---------------------------- */

function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <div className="absolute -top-10 -left-10 h-[28rem] w-[28rem] rounded-full blur-[80px] opacity-60 mix-blend-multiply bg-purple-200 animate-blob" />
      <div className="absolute -top-10 -right-10 h-[28rem] w-[28rem] rounded-full blur-[80px] opacity-60 mix-blend-multiply bg-cyan-200 animate-blob [animation-delay:2s]" />
      <div className="absolute -bottom-10 left-20 h-[28rem] w-[28rem] rounded-full blur-[80px] opacity-60 mix-blend-multiply bg-pink-200 animate-blob [animation-delay:4s]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/0 to-white/60" />
    </div>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();

  // “respiro” leggero durante scroll (in stile luminous)
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 0.75]);
  const gridOpacity = useTransform(scrollYProgress, [0, 1], [0.06, 0.12]);

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-smooth bg-slate-50 text-slate-800 selection:bg-indigo-500 selection:text-white">
      <AuroraBackground />

      {/* Overlay + micro grid (molto soft, non “cyber”) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div style={{ opacity: gridOpacity }} className="absolute inset-0">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
              backgroundSize: '84px 84px',
              maskImage:
                'radial-gradient(circle at 55% 30%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 72%)',
              WebkitMaskImage:
                'radial-gradient(circle at 55% 30%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 72%)',
            }}
          />
        </motion.div>

        {/* Glow dinamici (chiari) */}
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-purple-200/60 blur-3xl"
        />
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute top-1/4 -right-44 h-[520px] w-[520px] rounded-full bg-cyan-200/50 blur-3xl"
        />
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-pink-200/55 blur-3xl"
        />

        {/* Pulse layer */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute left-[12%] top-[22%] h-56 w-56 rounded-full bg-purple-200/35 blur-3xl" />
          <div className="absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute bottom-[10%] left-[45%] h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
        </motion.div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {/* Icona con badge gradiente */}
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div
                className="absolute inset-0 rounded-2xl opacity-90 shadow-glow"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
                }}
              />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white/85 ring-1 ring-white/60">
                <Image
                  src="/branding/cerbero-logo.svg"
                  alt="Cerbero AI logo"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Testo brand con gradiente */}
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Cerbero
                </span>{' '}
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-extrabold text-white"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
                  }}
                >
                  AI
                </span>
              </span>
              <span className="text-[11px] text-slate-500">
                Infrastruttura neurale · Non-custodial
              </span>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-8 text-xs text-slate-500 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="uppercase tracking-[0.22em] transition-colors hover:text-slate-900"
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 transition hover:text-slate-900"
            >
              Accedi
            </Link>

            <Link
              href="/signup"
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-glow transition hover:translate-y-[-1px] hover:brightness-110"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
              }}
            >
              Attiva accesso
            </Link>
          </nav>

          {/* Nav mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/login"
              className="rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-glow"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
              }}
            >
              Attiva
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENUTO */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-28 px-4 pb-20 pt-10 lg:px-6 lg:pt-16 lg:pb-24">
        {/* HERO */}
        <HeroCoscienzaSection />

        {/* COSCIENZA (blocco full width separato) */}
        <CoscienzaSection />

        {/* PROTOCOLLO (due canali) */}
        <NeuralSeparator label="PROTOCOLLO" />
        <ProtocolloDueCanaliSection />

        {/* ONBOARDING */}
        <NeuralSeparator label="ONBOARDING" />
        <OnboardingSection />

        {/* PRICING */}
        <NeuralSeparator label="PRICING" />
        <PricingSection />

        {/* CONTROLLO */}
        <NeuralSeparator label="CONTROLLO" />
        <ControlloSection />

        {/* COMING NEXT */}
        <NeuralSeparator label="COMING NEXT" />
        <ComingNextSection />

        {/* FOOTER */}
        <SiteFooter />
      </main>
    </div>
  );
}

/* --------------------------- NEURAL SEPARATOR ---------------------------- */

type NeuralSeparatorProps = { label?: string };

function NeuralSeparator({ label }: NeuralSeparatorProps) {
  return (
    <div className="relative mt-2 flex items-center justify-center">
      <div className="h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 backdrop-blur-md shadow-sm">
            <span className="h-1 w-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------ HERO + VIDEO (FIXED) --------------------------- */

function HeroCoscienzaSection() {
  return (
    <motion.section
      id="protocollo"
      variants={sectionContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-12 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-start"
    >
      {/* Copy */}
      <div className="space-y-7">
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-4"
        >
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            <span className="block text-slate-900">CERBERO</span>
            <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              ISTITUTO DI FINANZA ARTIFICIALE
            </span>
          </h1>

          <p className="max-w-xl text-base font-semibold text-slate-600">
            Un’infrastruttura neurale che coordina <span className="text-slate-900">decisioni</span> ed{' '}
            <span className="text-slate-900">esecuzione</span> su due canali operativi (DeFi e CeFi), con fondi sempre
            sotto il controllo dell’utente.
          </p>
        </motion.div>

        {/* Chips */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.04 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { label: 'NON-CUSTODIAL', glow: 'shadow-[0_0_22px_rgba(99,102,241,0.18)]' },
            { label: 'ICT / SMC', glow: 'shadow-[0_0_22px_rgba(236,72,153,0.14)]' },
            { label: 'RISK ENGINE', glow: 'shadow-[0_0_22px_rgba(168,85,247,0.14)]' },
            { label: 'LOG TRACCIABILE', glow: 'shadow-[0_0_22px_rgba(6,182,212,0.14)]' },
          ].map((c) => (
            <span
              key={c.label}
              className={`rounded-full border border-white/70 bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600 backdrop-blur ${c.glow}`}
            >
              {c.label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.07 }}
          className="flex flex-wrap items-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-glow transition hover:translate-y-[-1px] hover:brightness-110"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
              }}
            >
              Attiva accesso
            </Link>
          </motion.div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection('onboarding')}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/60 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-white"
          >
            Vedi il protocollo
          </motion.button>
        </motion.div>
      </div>

      {/* Video Hero (colonna destra, più “alto” e compatto) */}
      <motion.div
        variants={fadeIn}
        transition={{ duration: 0.75, ease: 'easeOut', delay: 0.05 }}
        className="relative lg:self-start"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/50 shadow-glass lg:max-w-[520px] lg:ml-auto">
          <video className="block w-full md:hidden aspect-[9/12] object-cover" autoPlay loop muted playsInline>
            <source src="/videos/hero-9-16.mp4" type="video/mp4" />
          </video>

          <video className="hidden w-full md:block aspect-[16/10] object-cover" autoPlay loop muted playsInline>
            <source src="/videos/hero-16-9.mp4" type="video/mp4" />
          </video>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/70 via-white/10 to-transparent" />

          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 backdrop-blur-md shadow-sm">
            <span className="inline-block h-1 w-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />
            Telemetry preview
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ------------------------------ COSCIENZA -------------------------------- */

function CoscienzaSection() {
  const items = [
    {
      n: '01',
      title: 'ANALISTA STRUTTURALE',
      desc:
        'Legge la geometria del mercato: price action, liquidità, order blocks, inefficienze (FVG). Identifica zone istituzionali.',
      icon: '🧩',
      grad: 'from-violet-600 via-indigo-600 to-blue-500',
      glow: 'shadow-[0_0_30px_rgba(99,102,241,0.35)]',
    },
    {
      n: '02',
      title: 'GESTORE CONTESTUALE',
      desc:
        'Valuta “meteo” finanziario: volatilità, sessioni (Londra/NY), news macro ad alto impatto. Se il contesto è instabile, blocca.',
      icon: '🌐',
      grad: 'from-blue-600 via-cyan-500 to-sky-400',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.35)]',
    },
    {
      n: '03',
      title: 'GARANTE DEL RISCHIO',
      desc:
        'Calcola size, stop loss strutturale e R:R. Ha diritto di veto: se è matematicamente svantaggioso, si scarta.',
      icon: '🛡️',
      grad: 'from-orange-500 via-rose-500 to-red-500',
      glow: 'shadow-[0_0_30px_rgba(244,63,94,0.35)]',
    },
  ];

  return (
    <motion.section
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="space-y-10"
    >
      <motion.div variants={fadeInUp} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 backdrop-blur shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
          COSCIENZA
        </div>

        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          COSCIENZA: IL CONSENSO A 3 TESTE
        </h2>

        <p className="mx-auto mt-3 max-w-3xl text-sm sm:text-base font-semibold text-slate-600">
          Cerbero non è un singolo algoritmo. È un sistema a consenso: l’ordine parte solo quando{' '}
          <span className="text-slate-900">struttura</span>, <span className="text-slate-900">contesto</span> e{' '}
          <span className="text-slate-900">rischio</span> convergono. Se una testa non è d’accordo, l’esecuzione si ferma.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-6 lg:grid-cols-3">
        {items.map((it) => (
          <motion.div
            key={it.n}
            whileHover={{ y: -6, scale: 1.01 }}
            animate={{
              boxShadow: [
                '0 0 0 rgba(0,0,0,0)',
                '0 0 40px rgba(99,102,241,0.12)',
                '0 0 0 rgba(0,0,0,0)',
              ],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`relative overflow-hidden rounded-3xl p-[1px] ${it.glow}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${it.grad}`} />

            <div className="relative rounded-3xl p-8 text-white bg-slate-950/20 backdrop-blur-xl aspect-square flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-5xl leading-none">{it.icon}</div>
                <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/20" />
              </div>

              <div className="mt-6">
                <div className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-white/90">
                  {it.n} · {it.title}
                </div>
                <p className="mt-4 text-sm sm:text-base font-semibold leading-relaxed text-white/85">
                  {it.desc}
                </p>
              </div>

              <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-white/70 to-white/0" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600 backdrop-blur">
          ICT / SMC
        </span>
        <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600 backdrop-blur">
          VETO RISCHIO
        </span>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass-panel rounded-3xl p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">PERCHÉ ICT / SMC</div>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Non “prevede” con indicatori retail in ritardo. Traccia le impronte dei grandi player e si posiziona solo quando
          struttura, contesto e rischio sono coerenti.
        </p>
      </motion.div>
    </motion.section>
  );
}

/* -------------------------- PROTOCOLLO: DUE CANALI ----------------------- */

function ProtocolloDueCanaliSection() {
  return (
    <motion.section
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className="space-y-8"
    >
      <motion.div variants={fadeInUp} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 backdrop-blur shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
          PROTOCOLLO OPERATIVO
        </div>

        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-slate-900">Un solo Cervello.</span>{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Due Canali.
          </span>
        </h2>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-6 lg:grid-cols-2">
        {/* DeFi */}
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-pink-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-200/55 blur-3xl" />

          <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-extrabold text-slate-900">DeFi Mode</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-pink-600/80">
                  Trading Account on-chain
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-glow" />
            </div>

            <p className="text-sm font-semibold leading-relaxed text-slate-600">
              Viene creato automaticamente il tuo <span className="text-slate-900">Trading Account on-chain personale</span>.
              Depositi e prelevi quando vuoi. Un wallet esterno serve solo per il prelievo/settlement.
            </p>

            <div className="h-1 w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-transparent" />
          </div>
        </div>

        {/* CeFi */}
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-extrabold text-slate-900">CeFi Mode</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-700/80">
                  Broker connect API
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 shadow-glow" />
            </div>

            <p className="text-sm font-semibold leading-relaxed text-slate-600">
              Colleghi il tuo conto broker MT5 via API. Permessi di <span className="text-slate-900">sola esecuzione</span>:
              nessun prelievo, nessun bonifico possibile.
            </p>

            <div className="h-1 w-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-transparent" />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ----------------------------- ONBOARDING -------------------------------- */

function OnboardingSection() {
  return (
    <motion.section
      id="onboarding"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 backdrop-blur shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
          ONBOARDING
        </div>

        <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          ATTIVAZIONE IN 3 PASSAGGI.
          <span className="block bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            SEMPLICE. GUIDATA. CHIARA.
          </span>
        </h3>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass-panel relative overflow-hidden rounded-3xl p-6">
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-pink-200/55 blur-3xl" />
          <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-cyan-200/55 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-purple-200/55 blur-3xl" />
        </motion.div>

        <div className="relative grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
          <StepCard
            n="01"
            title="ACCESSO"
            body="Crea un account e entri in dashboard. Vedi canali e parametri."
            accent="from-cyan-500 to-indigo-500"
          />

          <ArrowConnector />

          <StepCard
            n="02"
            title="CANALE OPERATIVO"
            body={
              <>
                <span className="text-slate-900">DeFi:</span> creazione Trading Account on-chain personale. <br />
                <span className="text-slate-900">CeFi:</span> connessione broker MT5 via API.
              </>
            }
            accent="from-indigo-500 to-purple-500"
          />

          <ArrowConnector />

          <StepCard
            n="03"
            title="AUTOPILOT"
            body="Attivi il pilota. Cerbero opera in continuità solo entro i limiti definiti."
            accent="from-emerald-500 to-cyan-500"
          />
        </div>

        <p className="relative mt-4 text-center text-[12px] font-semibold text-slate-500">
          Una volta attivo, il sistema può operare 24/7 senza richiedere presenza costante dell’utente.
        </p>
      </motion.div>
    </motion.section>
  );
}

function ArrowConnector() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <motion.div
        className="h-10 w-10 rounded-full border border-white/70 bg-white/65 backdrop-blur shadow-sm"
        animate={{
          boxShadow: [
            '0 8px 18px rgba(31,38,135,0.04)',
            '0 14px 28px rgba(99,102,241,0.10)',
            '0 8px 18px rgba(31,38,135,0.04)',
          ],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex h-full w-full items-center justify-center text-slate-500">→</div>
      </motion.div>
    </div>
  );
}

function StepCard({
  n,
  title,
  body,
  accent,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5">
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accent}`} />
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600">
          {n}
        </div>
        <div className="text-[12px] font-bold uppercase tracking-[0.22em] text-slate-600">{title}</div>
      </div>
      <div className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{body}</div>
    </div>
  );
}

/* ------------------------------ PRICING ---------------------------------- */

function PricingSection() {
  return (
    <motion.section
      id="pricing"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className="space-y-7"
    >
      <motion.div variants={fadeInUp} className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          FLAT. TRASPARENTE.
          <span className="block bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            NESSUNA % SUI RISULTATI.
          </span>
        </h2>
        <p className="mx-auto max-w-2xl text-sm font-semibold text-slate-600 sm:text-base">
          Un abbonamento mensile per l’accesso all’infrastruttura Cerbero. Nessuna commissione variabile,
          nessuna partecipazione ai risultati, nessuna custodia del capitale.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp} className="mx-auto w-full max-w-md">
        <div className="glass-panel relative overflow-hidden rounded-3xl p-7 shadow-glass">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-pink-200/55 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex items-baseline justify-center gap-2">
              <span className="text-5xl font-extrabold text-slate-900">99€</span>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">/ mese</span>
            </div>

            <ul className="mb-6 space-y-2 text-left text-sm font-semibold text-slate-700">
              <li className="flex gap-2">
                <span className="mt-0.5 text-slate-400">•</span>
                <span>Accesso completo al protocollo e al risk engine.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-slate-400">•</span>
                <span>Trading Account on-chain personale (canale DeFi).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-slate-400">•</span>
                <span>Connessione broker via API (canale CeFi).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-slate-400">•</span>
                <span>Log: tracciabilità decisioni ed esecuzioni.</span>
              </li>
            </ul>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-glow transition hover:translate-y-[-1px] hover:brightness-110"
                style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #6366f1, #a855f7, #ec4899)' }}
              >
                Attiva l’accesso
              </Link>
            </motion.div>

            <p className="mt-3 text-center text-[11px] font-semibold text-slate-500">
              Pagamento gestito tramite Stripe. Dopo l’attivazione vieni portato nella dashboard.
            </p>

            <p className="mt-6 text-center text-[11px] font-semibold text-slate-400">
              Servizio tecnologico. Nessuna consulenza finanziaria. Nessuna garanzia di risultato. Il capitale resta
              dell’utente.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ------------------------------ CONTROLLO -------------------------------- */

function ControlloSection() {
  return (
    <motion.section
      id="controllo"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className="space-y-7"
    >
      <motion.div variants={fadeInUp} className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700 backdrop-blur">
          CONTROLLO & SICUREZZA
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          CONTROLLO OPERATIVO.
          <span className="block bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            NON CUSTODIAL.
          </span>
        </h2>

        <p className="max-w-2xl text-sm font-semibold text-slate-600 sm:text-base">
          Cerbero è progettato per essere controllabile. Non richiede fiducia cieca: opera entro regole esplicite e lascia
          tracce consultabili.
        </p>
      </motion.div>

      {/* FULL WIDTH: 3 CARD ORIZZONTALI (niente card destra “Protezione attive”) */}
      <motion.div variants={fadeInUp} className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel rounded-3xl p-6">
          <Bullet title="NON CUSTODIA" tone="cyan">
            Cerbero non detiene capitale e non può trasferire fondi verso l’esterno.
          </Bullet>
        </div>

        <div className="glass-panel rounded-3xl p-6">
          <Bullet title="RISCHIO CALCOLATO" tone="fuchsia">
            Stop loss strutturale, controllo R:R e protezioni su soglie critiche prima di ogni esecuzione.
          </Bullet>
        </div>

        <div className="glass-panel rounded-3xl p-6">
          <Bullet title="STORICO OPERAZIONI" tone="emerald">
            Ogni azione e intenzione viene registrata: non una black box, ma un flusso tracciabile e consultabile.
          </Bullet>
        </div>
      </motion.div>
    </motion.section>
  );
}

function Bullet({
  title,
  tone,
  children,
}: {
  title: string;
  tone: 'cyan' | 'fuchsia' | 'emerald';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'cyan'
      ? 'text-cyan-700'
      : tone === 'fuchsia'
      ? 'text-pink-700'
      : 'text-emerald-700';

  return (
    <div className="space-y-2">
      <div className={`text-[12px] font-bold uppercase tracking-[0.22em] ${toneClass}`}>{title}</div>
      <div className="text-sm font-semibold text-slate-600">{children}</div>
    </div>
  );
}

/* ----------------------------- COMING NEXT ------------------------------- */

function ComingNextSection() {
  return (
    <motion.section
      id="coming"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-purple-700 backdrop-blur">
          EVOLUZIONE DELL’INFRASTRUTTURA
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          CHIUDERE IL CICLO:
          <span className="block bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            DAL CAPITALE ALL’USO REALE.
          </span>
        </h2>
      </motion.div>

      <motion.div variants={fadeInUp} className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
          Cerbero è progettato per collegare <span className="text-slate-900">esecuzione finanziaria</span> e{' '}
          <span className="text-slate-900">utilizzo del capitale</span>. L’integrazione di on-ramp, off-ramp e strumenti di
          accesso è parte dell’evoluzione del protocollo, mantenendo invariati i principi: controllo dell’utente,
          tracciabilità e limiti.
        </p>

        <div className="glass-panel rounded-3xl p-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            IN VALUTAZIONE / QUANDO DISPONIBILE
          </div>

          <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
            <li>
              • <span className="text-cyan-700">On-ramp</span> e <span className="text-pink-700">off-ramp</span>{' '}
              integrati (accesso e uscita semplificati).
            </li>
            <li>
              • <span className="text-purple-700">Identità operativa</span> e coordinate di conto per flussi più lineari.
            </li>
            <li>
              • <span className="text-emerald-700">Strumenti di spesa</span> collegati al capitale, senza cambiare i
              principi non-custodial.
            </li>
          </ul>

          <p className="mt-4 text-[11px] font-semibold text-slate-500">
            Nota: questa sezione descrive una direzione del prodotto e non costituisce impegno, promessa o tempistica.
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* -------------------------------- FOOTER -------------------------------- */

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200/70 bg-white/40 pt-8 pb-6 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row md:items-start">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div
              className="absolute inset-0 rounded-2xl opacity-90 shadow-glow"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
              }}
            />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white/85 ring-1 ring-white/60">
              <Image
                src="/branding/cerbero-logo.svg"
                alt="Cerbero AI logo"
                width={34}
                height={34}
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Cerbero
              </span>{' '}
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-extrabold text-white"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #06b6d4)',
                }}
              >
                AI
              </span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              © 2025 Cerbero. All rights reserved.
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:items-end">
          <div className="text-center text-[11px] font-semibold text-slate-500 md:text-right">
            Servizio tecnologico. Nessuna custodia dei fondi. Nessuna consulenza finanziaria. Nessuna garanzia di
            risultato.
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[11px] font-semibold text-slate-500 md:justify-end">
            <a href="/legal/privacy" className="transition hover:text-slate-900">
              Privacy
            </a>
            <a href="/legal/terms" className="transition hover:text-slate-900">
              Termini &amp; Condizioni
            </a>
            <a href="/legal/cookies" className="transition hover:text-slate-900">
              Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
