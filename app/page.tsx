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

export default function HomePage() {
  const { scrollYProgress } = useScroll();

  // Glow dinamici
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 0.95]);

  // Grid overlay che “respira” mentre scrolli
  const gridOpacity = useTransform(scrollYProgress, [0, 1], [0.12, 0.22]);

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-smooth bg-black text-white">
      {/* Background globale */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />

        {/* Grid overlay */}
        <motion.div
          style={{ opacity: gridOpacity }}
          className="absolute inset-0"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
              maskImage:
                'radial-gradient(circle at 55% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 70%)',
              WebkitMaskImage:
                'radial-gradient(circle at 55% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 70%)',
            }}
          />
        </motion.div>

        {/* Glow principali dinamici */}
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-fuchsia-600/40 blur-3xl"
        />
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute top-1/4 -right-44 h-[520px] w-[520px] rounded-full bg-sky-500/28 blur-3xl"
        />
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute bottom-[-220px] left-1/3 h-[620px] w-[620px] rounded-full bg-violet-500/30 blur-3xl"
        />

        {/* Pulse layer (sempre vivo) */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute left-[12%] top-[22%] h-56 w-56 rounded-full bg-fuchsia-500/18 blur-3xl" />
          <div className="absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-sky-500/14 blur-3xl" />
          <div className="absolute bottom-[10%] left-[45%] h-72 w-72 rounded-full bg-violet-500/14 blur-3xl" />
        </motion.div>
      </div>

      {/* Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/0 to-black/90" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <Image
                src="/branding/cerbero-logo.svg"
                alt="Cerbero AI logo"
                width={40}
                height={40}
                className="object-contain drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">
                Cerbero{' '}
                <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
                  AI
                </span>
              </span>
              <span className="text-[11px] text-white/60">Infrastruttura neurale · Non-custodial</span>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-8 text-xs text-white/70 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="uppercase tracking-[0.22em] transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:text-white"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] shadow-lg shadow-fuchsia-500/40 transition hover:brightness-110"
              style={{ backgroundImage: 'linear-gradient(135deg, #ec38ff, #9b6cff, #00eaff)' }}
            >
              Attiva accesso
            </Link>
          </nav>

          {/* Nav mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-lg shadow-fuchsia-500/40"
              style={{ backgroundImage: 'linear-gradient(135deg, #ec38ff, #9b6cff, #00eaff)' }}
            >
              Attiva
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENUTO */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-28 px-4 pb-20 pt-10 lg:px-6 lg:pt-16 lg:pb-24">
        {/* HERO + COSCIENZA */}
        <HeroCoscienzaSection />

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
      <div className="h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60 backdrop-blur-md">
            <span className="h-1 w-6 rounded-full bg-gradient-to-r from-[#00F0FF] via-[#9b6cff] to-[#BC13FE]" />
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------ HERO + COSCIENZA (B) --------------------------- */

function HeroCoscienzaSection() {
  return (
    <motion.section
      id="protocollo"
      variants={sectionContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-12 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-center"
    >
      {/* Copy */}
      <div className="space-y-7">
        <motion.div variants={fadeInUp} transition={{ duration: 0.6, ease: 'easeOut' }} className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            <span className="block">CERBERO</span>
            <span className="block bg-gradient-to-r from-[#00F0FF] via-[#5eead4] to-[#BC13FE] bg-clip-text text-transparent">
              ISTITUTO DI FINANZA ARTIFICIALE
            </span>
          </h1>

          <p className="max-w-xl text-base font-semibold text-white/80">
            Un’infrastruttura neurale che coordina <span className="text-white">decisioni</span> ed{' '}
            <span className="text-white">esecuzione</span> su due canali operativi (DeFi e CeFi), con fondi sempre sotto
            il controllo dell’utente.
          </p>
        </motion.div>

        {/* Chips (senza “permessi revocabili”) */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.04 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { label: 'NON-CUSTODIAL', glow: 'shadow-[0_0_28px_rgba(34,211,238,0.25)]' },
            { label: 'ICT / SMC', glow: 'shadow-[0_0_28px_rgba(236,72,153,0.25)]' },
            { label: 'RISK ENGINE', glow: 'shadow-[0_0_28px_rgba(167,139,250,0.25)]' },
            { label: 'LOG TRACCIABILE', glow: 'shadow-[0_0_28px_rgba(56,189,248,0.25)]' },
          ].map((c) => (
            <span
              key={c.label}
              className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 backdrop-blur ${c.glow}`}
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
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] shadow-[0_0_50px_rgba(236,72,153,0.45)] transition hover:brightness-110"
              style={{ backgroundImage: 'linear-gradient(135deg, #ec38ff, #9b6cff, #00eaff)' }}
            >
              Attiva accesso
            </Link>
          </motion.div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection('onboarding')}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/85 transition hover:border-white/40 hover:bg-white/10"
          >
            Vedi il protocollo
          </motion.button>
        </motion.div>

        {/* Coscienza card (pulsante, articolata, con 3 teste + ICT/SMC) */}
        <motion.div variants={fadeIn} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}>
          <CoscienzaConsensusCard />
        </motion.div>
      </div>

      {/* Video Hero */}
      <motion.div variants={fadeIn} transition={{ duration: 0.75, ease: 'easeOut', delay: 0.05 }} className="relative">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_90px_rgba(56,189,248,0.45)]">
          <video className="hidden h-full w-full md:block" autoPlay loop muted playsInline>
            <source src="/videos/hero-16-9.mp4" type="video/mp4" />
          </video>

          <video className="block h-full w-full md:hidden" autoPlay loop muted playsInline>
            <source src="/videos/hero-9-16.mp4" type="video/mp4" />
          </video>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
            <span className="inline-block h-1 w-8 rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-300 to-sky-300" />
            Telemetry preview
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

function CoscienzaConsensusCard() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-slate-950/85 via-black/60 to-slate-950/85 p-5 backdrop-blur-2xl"
      animate={{ boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 55px rgba(236,72,153,0.18)', '0 0 55px rgba(34,211,238,0.18)', '0 0 0 rgba(0,0,0,0)'] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Glow border */}
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute -right-24 -top-12 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-90px] left-1/3 h-64 w-64 rounded-full bg-violet-500/18 blur-3xl" />
      </div>

      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            COSCIENZA · CONSENSO A 3 TESTE
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
              ICT / SMC
            </span>
            <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
              VETO RISCHIO
            </span>
          </div>
        </div>

        <p className="text-sm font-semibold leading-relaxed text-white/85">
          Cerbero non è un singolo algoritmo. È un sistema a consenso: l’ordine parte solo quando{' '}
          <span className="text-white">struttura</span>, <span className="text-white">contesto</span> e{' '}
          <span className="text-white">rischio</span> convergono. Se una testa non è d’accordo, l’esecuzione si ferma.
        </p>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/90">
              01 · ANALISTA STRUTTURALE
            </div>
            <p className="text-[12px] font-semibold text-white/80">
              Legge la geometria del mercato: price action, liquidità, order blocks, inefficienze (FVG).
              Identifica zone istituzionali.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/90">
              02 · GESTORE CONTESTUALE
            </div>
            <p className="text-[12px] font-semibold text-white/80">
              Valuta “meteo” finanziario: volatilità, sessioni (Londra/NY), news macro ad alto impatto.
              Se il contesto è instabile, blocca.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/90">
              03 · GARANTE DEL RISCHIO
            </div>
            <p className="text-[12px] font-semibold text-white/80">
              Calcola size, stop loss strutturale e R:R. Ha diritto di veto: se è matematicamente svantaggioso, si scarta.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">PERCHÉ ICT / SMC</div>
          <p className="mt-1 text-[12px] font-semibold text-white/80">
            Non “prevede” con indicatori retail in ritardo. Traccia le impronte dei grandi player e si posiziona solo quando
            struttura, contesto e rischio sono coerenti.
          </p>
        </div>
      </div>
    </motion.div>
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
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
          PROTOCOLLO OPERATIVO
        </div>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-white">Un solo Cervello.</span>{' '}
          <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
            Due Canali.
          </span>
        </h2>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-6 lg:grid-cols-2">
        {/* DeFi */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-500/18 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/14 blur-3xl" />

          <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold text-white">DeFi Mode</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-200/80">
                  Trading Account on-chain
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/30" />
            </div>

            <p className="text-sm font-semibold leading-relaxed text-white/80">
              Viene creato automaticamente il tuo <span className="text-white">Trading Account on-chain personale</span>.
              Depositi e prelevi quando vuoi. Un wallet esterno serve solo per il prelievo/settlement.
            </p>

            <div className="h-1 w-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-300 to-transparent" />
          </div>
        </div>

        {/* CeFi */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-sky-500/16 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold text-white">CeFi Mode</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/80">
                  Broker connect API
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/30" />
            </div>

            <p className="text-sm font-semibold leading-relaxed text-white/80">
              Colleghi il tuo conto broker MT5 via API. Permessi di <span className="text-white">sola esecuzione</span>:
              nessun prelievo, nessun bonifico possibile.
            </p>

            <div className="h-1 w-full rounded-full bg-gradient-to-r from-sky-300 via-cyan-200 to-transparent" />
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
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          ONBOARDING
        </div>

        <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          ATTIVAZIONE IN 3 PASSAGGI.
          <span className="block bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
            SEMPLICE. GUIDATA. CHIARA.
          </span>
        </h3>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/75 via-black/55 to-slate-950/75 p-6 backdrop-blur-2xl"
      >
        {/* glow pulse */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/18 blur-3xl" />
          <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-sky-500/16 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-violet-500/14 blur-3xl" />
        </motion.div>

        <div className="relative grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
          <StepCard
            n="01"
            title="ACCESSO"
            body="Crea un account e entri in dashboard. Vedi canali e parametri."
            accent="from-sky-300 to-cyan-200"
          />

          <ArrowConnector />

          <StepCard
            n="02"
            title="CANALE OPERATIVO"
            body={
              <>
                <span className="text-white">DeFi:</span> creazione Trading Account on-chain personale. <br />
                <span className="text-white">CeFi:</span> connessione broker MT5 via API.
              </>
            }
            accent="from-fuchsia-400 to-violet-300"
          />

          <ArrowConnector />

          <StepCard
            n="03"
            title="AUTOPILOT"
            body="Attivi il pilota. Cerbero opera in continuità solo entro i limiti definiti."
            accent="from-emerald-300 to-sky-300"
          />
        </div>

        <p className="relative mt-4 text-center text-[12px] font-semibold text-white/70">
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
        className="h-10 w-10 rounded-full border border-white/10 bg-white/5 backdrop-blur"
        animate={{ boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 35px rgba(34,211,238,0.18)', '0 0 0 rgba(0,0,0,0)'] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex h-full w-full items-center justify-center text-white/70">→</div>
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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-5">
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accent}`} />
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
          {n}
        </div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/75">{title}</div>
      </div>
      <div className="mt-3 text-sm font-semibold leading-relaxed text-white/80">{body}</div>
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
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          FLAT. TRASPARENTE.
          <span className="block bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
            NESSUNA % SUI RISULTATI.
          </span>
        </h2>
        <p className="mx-auto max-w-2xl text-sm font-semibold text-white/75 sm:text-base">
          Un abbonamento mensile per l’accesso all’infrastruttura Cerbero. Nessuna commissione variabile,
          nessuna partecipazione ai risultati, nessuna custodia del capitale.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp} className="mx-auto w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/75 via-slate-950 to-sky-950/60 p-7 backdrop-blur-2xl shadow-[0_0_65px_rgba(56,189,248,0.45)]">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/18 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-fuchsia-500/16 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex items-baseline justify-center gap-2">
              <span className="text-5xl font-semibold text-white">99€</span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">/ mese</span>
            </div>

            <ul className="mb-6 space-y-2 text-left text-sm font-semibold text-white/80">
              <li className="flex gap-2">
                <span className="mt-0.5">•</span>
                <span>Accesso completo al protocollo e al risk engine.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5">•</span>
                <span>Trading Account on-chain personale (canale DeFi).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5">•</span>
                <span>Connessione broker via API (canale CeFi).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5">•</span>
                <span>Log: tracciabilità decisioni ed esecuzioni.</span>
              </li>
            </ul>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] shadow-[0_0_55px_rgba(59,130,246,0.55)] transition hover:brightness-110"
                style={{ backgroundImage: 'linear-gradient(135deg, #00eaff, #9b6cff, #ec38ff)' }}
              >
                Attiva l’accesso
              </Link>
            </motion.div>

            <p className="mt-3 text-center text-[11px] font-semibold text-white/45">
              Pagamento gestito tramite Stripe. Dopo l’attivazione vieni portato nella dashboard.
            </p>

            <p className="mt-6 text-center text-[11px] font-semibold text-white/30">
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
        <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-600/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/90">
          CONTROLLO & SICUREZZA
        </div>

        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          CONTROLLO OPERATIVO.
          <span className="block bg-gradient-to-r from-emerald-200 to-sky-200 bg-clip-text text-transparent">
            NON CUSTODIA.
          </span>
        </h2>

        <p className="max-w-2xl text-sm font-semibold text-white/75 sm:text-base">
          Cerbero è progettato per essere controllabile. Non richiede fiducia cieca: opera entro regole esplicite e lascia
          tracce consultabili.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-6 lg:grid-cols-2">
        {/* Left: bullets (titoli colorati) */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <Bullet title="NON CUSTODIA" tone="cyan">
            Cerbero non detiene capitale e non può trasferire fondi verso l’esterno.
          </Bullet>
          <Bullet title="RISCHIO CALCOLATO" tone="fuchsia">
            Stop loss strutturale, controllo R:R e protezioni su soglie critiche prima di ogni esecuzione.
          </Bullet>
          <Bullet title="STORICO OPERAZIONI" tone="emerald">
            Ogni azione e intenzione viene registrata: non una black box, ma un flusso tracciabile e consultabile.
          </Bullet>
        </div>

        {/* Right: card “clean” (no audit window) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-black/55 to-slate-950/70 p-6 backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-sky-500/16 blur-3xl" />
          <div className="pointer-events-none absolute -left-28 bottom-[-140px] h-80 w-80 rounded-full bg-fuchsia-500/14 blur-3xl" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                PROTEZIONI ATTIVE · SEMPRE ON
              </div>
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Always on
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MiniStat title="Consensus" value="3/3" accent="from-emerald-300 to-sky-300" />
              <MiniStat title="Risk Check" value="PASS" accent="from-sky-300 to-cyan-200" />
              <MiniStat title="R:R Min" value="≥ 1:2" accent="from-fuchsia-400 to-violet-300" />
              <MiniStat title="Guard Mode" value="READY" accent="from-violet-300 to-sky-300" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                LOG & VERIFICABILITÀ
              </div>
              <p className="mt-2 text-sm font-semibold text-white/78">
                Ogni decisione viene salvata insieme alle motivazioni (struttura, contesto, rischio). In dashboard l’utente
                legge “cosa” e “perché”.
              </p>
            </div>
          </div>
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
      ? 'text-cyan-200'
      : tone === 'fuchsia'
      ? 'text-fuchsia-200'
      : 'text-emerald-200';

  return (
    <div className="space-y-1">
      <div className={`text-[12px] font-semibold uppercase tracking-[0.22em] ${toneClass}`}>{title}</div>
      <div className="text-sm font-semibold text-white/80">{children}</div>
    </div>
  );
}

function MiniStat({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accent}`} />
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">{title}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
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
        <div className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-600/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100/90">
          EVOLUZIONE DELL’INFRASTRUTTURA
        </div>

        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          CHIUDERE IL CICLO:
          <span className="block bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
            DAL CAPITALE ALL’USO REALE.
          </span>
        </h2>
      </motion.div>

      <motion.div variants={fadeInUp} className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold leading-relaxed text-white/80 sm:text-base">
          Cerbero è progettato per collegare <span className="text-white">esecuzione finanziaria</span> e{' '}
          <span className="text-white">utilizzo del capitale</span>. L’integrazione di on-ramp, off-ramp e strumenti di
          accesso è parte dell’evoluzione del protocollo, mantenendo invariati i principi: controllo dell’utente,
          tracciabilità e limiti.
        </p>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            IN VALUTAZIONE / QUANDO DISPONIBILE
          </div>

          <ul className="mt-3 space-y-2 text-sm font-semibold text-white/80">
            <li>
              • <span className="text-cyan-200">On-ramp</span> e <span className="text-fuchsia-200">off-ramp</span>{' '}
              integrati (accesso e uscita semplificati).
            </li>
            <li>
              • <span className="text-violet-200">Identità operativa</span> e coordinate di conto per flussi più lineari.
            </li>
            <li>
              • <span className="text-emerald-200">Strumenti di spesa</span> collegati al capitale, senza cambiare i
              principi non-custodial.
            </li>
          </ul>

          <p className="mt-4 text-[11px] font-semibold text-white/45">
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
    <footer className="mt-10 border-t border-white/10 bg-gradient-to-b from-black/40 via-black/70 to-black/95 pt-8 pb-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row md:items-start">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <Image
              src="/branding/cerbero-logo.svg"
              alt="Cerbero AI logo"
              width={40}
              height={40}
              className="object-contain drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">
              Cerbero <span className="text-sky-400">AI</span>
            </span>
            <span className="text-[11px] font-semibold text-white/55">© 2025 Cerbero. All rights reserved.</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:items-end">
          <div className="text-center text-[11px] font-semibold text-white/35 md:text-right">
            Servizio tecnologico. Nessuna custodia dei fondi. Nessuna consulenza finanziaria. Nessuna garanzia di
            risultato.
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[11px] font-semibold text-white/60 md:justify-end">
            <a href="/legal/privacy" className="transition hover:text-white">
              Privacy
            </a>
            <a href="/legal/terms" className="transition hover:text-white">
              Termini &amp; Condizioni
            </a>
            <a href="/legal/cookies" className="transition hover:text-white">
              Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
