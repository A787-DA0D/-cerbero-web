'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

// NAV
const navItems = [
  { id: 'vision', label: 'Visione' },
  { id: 'trust', label: 'Come funziona' },
  { id: 'pricing', label: 'Pricing' },
];

function scrollToSection(id: string) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Variants base
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Contenitori con stagger per micro-animazioni
const sectionContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Dataset per widget LIVE OPERATIONS
const liveFeedData = [
  { type: 'PROFIT', symbol: 'EUR/USD', action: 'CLOSE LONG', value: '+0.85%', time: 'Just now', icon: '🟢' },
  { type: 'AI_LOG', symbol: 'SYSTEM', action: 'SCANNING', value: 'Volatility Analysis: LOW', time: '10 sec ago', icon: '🔵' },
  { type: 'ENTRY', symbol: 'XAU/USD', action: 'OPEN LONG', value: '@ 2048.50', time: '2 min ago', icon: '⚡' },
  { type: 'PROFIT', symbol: 'BTC/USD', action: 'TP HIT', value: '+2.1%', time: '5 min ago', icon: '🟢' },
  { type: 'RISK', symbol: 'GUARD', action: 'PROTECTION', value: 'Stop Loss Trailing Active', time: '8 min ago', icon: '🛡️' },
  { type: 'ENTRY', symbol: 'NAS100', action: 'OPEN SHORT', value: 'Pattern A+ Detected', time: '12 min ago', icon: '⚡' },
  { type: 'AI_LOG', symbol: 'GNS', action: 'SYNC', value: 'Wallet Connection Stable', time: '15 min ago', icon: '🔵' },
  { type: 'PROFIT', symbol: 'GBP/JPY', action: 'CLOSE SHORT', value: '+0.6%', time: '22 min ago', icon: '🟢' },
  { type: 'ENTRY', symbol: 'ETH/USD', action: 'SCALPING', value: 'Liquidity Grab Detected', time: '28 min ago', icon: '⚡' },
  { type: 'PROFIT', symbol: 'USOIL', action: 'TP HIT', value: '+1.4%', time: '35 min ago', icon: '🟢' },
];

export default function HomePage() {
  const { scrollYProgress } = useScroll();

  // Glow dinamici
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const glowOpacity = useTransform(scrollYProgress, [0.6, 1], [0.6, 1]);

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-smooth bg-black text-white">
      {/* Background globale */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />

        {/* Glow principali dinamici */}
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-fuchsia-600/40 blur-3xl"
        />
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/25 blur-3xl"
        />
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full bg-violet-500/30 blur-3xl"
        />
      </div>

      {/* Overlay per scurire un po' il fondo */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/0 to-black/85" />

      {/* HEADER STICKY GLASS */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
          {/* Logo / Brand */}
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
              <span className="text-[11px] text-white/60">
                Coscienza Finanziaria Autonoma
              </span>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition hover:text-white"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg shadow-fuchsia-500/40 transition hover:brightness-110"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #ec38ff, #9b6cff, #00eaff)',
              }}
            >
              Avvia Pilota
            </Link>
          </nav>

          {/* Nav mobile essenziale */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/80"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg shadow-fuchsia-500/40"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #ec38ff, #9b6cff, #00eaff)',
              }}
            >
              Avvia Pilota
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENUTO */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-32 px-4 pb-20 pt-10 lg:px-6 lg:pt-16 lg:pb-24">
        {/* HERO */}
        <HeroSection />

        {/* Separator + ORB COSCIENZA */}
        <NeuralSeparator label="La Coscienza" />
        <CoscienzaOrbSection />

        {/* VISION */}
        <VisionSection />

        {/* Separator */}
        <NeuralSeparator label="Come funziona" />

        {/* TRUST + LIVE OPERATIONS + FLOW */}
        <TrustSection />

        {/* Separator */}
        <NeuralSeparator label="Accesso & Pricing" />

        {/* PRICING */}
        <PricingSection />

        {/* FOOTER */}
        <SiteFooter />
      </main>
    </div>
  );
}

/* ----------------------------- HERO SECTION ----------------------------- */

function HeroSection() {
  return (
    <motion.section
      id="hero"
      variants={sectionContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-10 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-center"
    >
      {/* Copy */}
      <div className="space-y-8">
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-fuchsia-200/90">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(244,114,182,1)]" />
              Autotrading Istituzionale • Arbitrum
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Data driven since 2020
            </p>
          </div>

          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            <span className="block">
              SVEGLIA I TUOI SOLDI.
            </span>
            <span className="mt-1 block bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
              L&apos;EVOLUZIONE DEL TRADING È QUI.
            </span>
          </h1>

          <p className="max-w-xl text-sm text-white/70 sm:text-base">
            Dimentica le banche che ti danno zero. Cerbero è il primo sistema di{' '}
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text font-semibold text-transparent">
              Autotrading Istituzionale
            </span>{' '}
            accessibile a tutti.
            Collega il tuo conto, attiva l&apos;interruttore e lascia che la Coscienza generi profitti per te.
            Senza sforzo. Senza intermediari.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
          className="flex flex-wrap items-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold shadow-[0_0_35px_rgba(236,72,153,0.65)] transition hover:brightness-110"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #ec38ff, #9b6cff, #00eaff)',
              }}
            >
              Avvia il Pilota
            </Link>
          </motion.div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection('trust')}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:bg-white/10"
          >
            Guarda come funziona
          </motion.button>
        </motion.div>

        <motion.div
          variants={fadeIn}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.12 }}
          className="flex flex-wrap gap-6 text-[11px] text-white/50"
        >
          <div className="space-y-1 max-w-xs">
            <p className="font-semibold text-white/70">Tua Proprietà</p>
            <p>I fondi restano sempre nel tuo wallet personale. Nessun conto omnibus, nessuna banca in mezzo.</p>
          </div>
          <div className="space-y-1 max-w-xs">
            <p className="font-semibold text-white/70">Prelievo istantaneo</p>
            <p>Preleva i profitti quando vuoi, in un click. Tu decidi quando spegnere Cerbero.</p>
          </div>
        </motion.div>
      </div>

      {/* Video Hero responsive */}
      <motion.div
        variants={fadeIn}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_70px_rgba(59,130,246,0.55)]">
          {/* Video Desktop 16:9 */}
          <video
            className="hidden h-full w-full md:block"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/hero-16-9.mp4" type="video/mp4" />
          </video>

          {/* Video Mobile 9:16 */}
          <video
            className="block h-full w-full md:hidden"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/hero-9-16.mp4" type="video/mp4" />
          </video>

          {/* Overlay leggero */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Mini badge sovrapposto */}
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
            <span className="inline-block h-1 w-8 rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-300 to-sky-300" />
            Live Markets Feed
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ------------------ ORB COSCIENZA + NEURAL SEPARATOR ------------------- */

type NeuralSeparatorProps = {
  label?: string;
};

function NeuralSeparator({ label }: NeuralSeparatorProps) {
  return (
    <div className="relative mt-4 flex items-center justify-center">
      <div className="h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/50 backdrop-blur-md">
            <span className="h-1 w-6 rounded-full bg-gradient-to-r from-[#00F0FF] via-[#9b6cff] to-[#BC13FE]" />
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

function CoscienzaOrbSection() {
  return (
    <section className="relative mt-10 flex justify-center">
      <motion.div
        className="relative h-56 w-56 rounded-full border border-white/15 bg-black/80 shadow-[0_0_90px_rgba(236,72,153,0.65)]"
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Glow interno */}
        <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(236,56,255,0.55),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(0,234,255,0.6),transparent_55%)] blur-[1px]" />

        {/* Logo Cerbero al centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-black/50 backdrop-blur-md">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(236,56,255,0.35),transparent_60%)]" />
            <Image
              src="/branding/cerbero-logo.svg"
              alt="Cerbero AI logo"
              width={80}
              height={80}
              className="relative z-10 object-contain drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
            />
          </div>
        </div>

        {/* Linee neurali sottili intorno al logo */}
        <motion.div
          className="pointer-events-none absolute inset-7"
          animate={{ opacity: [0.4, 0.9, 0.4], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full opacity-75">
            <defs>
              <linearGradient id="orbStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ec38ff" />
                <stop offset="50%" stopColor="#9b6cff" />
                <stop offset="100%" stopColor="#00eaff" />
              </linearGradient>
            </defs>
            <path
              d="M10 100 Q 50 20 100 60 T 190 100"
              fill="none"
              stroke="url(#orbStroke)"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
            <path
              d="M20 140 Q 60 80 110 90 T 180 60"
              fill="none"
              stroke="url(#orbStroke)"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
            <path
              d="M30 40 Q 80 40 120 70 T 170 140"
              fill="none"
              stroke="url(#orbStroke)"
              strokeWidth="0.7"
              strokeOpacity="0.4"
            />
          </svg>
        </motion.div>

        {/* HUD testo migliorato */}
        <div className="pointer-events-none absolute -bottom-14 left-1/2 flex -translate-x-1/2 flex-col items-center text-center">
          <span className="rounded-full border border-white/15 bg-black/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
            Coscienza attiva
          </span>
          <span className="mt-2 text-[11px] text-white/70">
            Analisi continua · Esecuzione autonoma
          </span>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------- VISION SECTION ---------------------------- */

function VisionSection() {
  return (
    <motion.section
      id="vision"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-600/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-violet-100/90"
      >
        La Visione
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-start"
      >
        <div className="space-y-4">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            <span>IL TUO CAPITALE</span>
            <span className="block bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
              HA PRESO VITA.
            </span>
          </h2>
          <p className="text-sm text-white/70 sm:text-base">
            Abbiamo fuso tre Intelligenze Artificiali in un&apos;unica{' '}
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text font-semibold text-transparent">
              Coscienza Finanziaria
            </span>
            . Cerbero non dorme, non si stanca e non ha paura.
          </p>
          <p className="text-sm text-white/70 sm:text-base">
            Lavora sui mercati 24/7 con un unico obiettivo:
            far crescere la tua ricchezza mentre tu vivi la tua vita.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white/80">
            Cosa fa mentre tu dormi:
          </h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="mt-0.5">🟣</span>
              <div>
                <p className="font-medium text-white/80">Scansiona il Mondo</p>
                <p>Analizza milioni di dati globali ogni millisecondo.</p>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">🔵</span>
              <div>
                <p className="font-medium text-white/80">Protegge il Capitale</p>
                <p>Calcola il rischio prima di ogni mossa. La sicurezza è matematica.</p>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">🟢</span>
              <div>
                <p className="font-medium text-white/80">Colpisce con Precisione</p>
                <p>Esegue operazioni chirurgiche solo quando le probabilità sono a tuo favore.</p>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">🟡</span>
              <div>
                <p className="font-medium text-white/80">Ti rende Libero</p>
                <p>Tu guardi i risultati. Lui fa il lavoro sporco.</p>
              </div>
            </li>
          </ul>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ---------------------------- TRUST SECTION ----------------------------- */

function TrustSection() {
  return (
    <motion.section
      id="trust"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-600/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-100/90"
      >
        Come funziona
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-8 lg:grid-cols-2">
        {/* Testo a sinistra */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            <span>LA TUA CASSAFORTE DIGITALE.</span>
            <span className="mt-1 block bg-gradient-to-r from-emerald-200 to-sky-200 bg-clip-text text-transparent">
              NOI ABBIAMO L&apos;INTELLIGENZA, TU HAI LE CHIAVI.
            </span>
          </h2>
          <p className="text-sm text-white/70 sm:text-base">
            La sicurezza è la nostra ossessione. Quando ti iscrivi, creiamo una{' '}
            <span className="font-semibold text-white">Cassaforte Personale (Wallet)</span> dedicata solo a te.
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Noi non tocchiamo mai i tuoi soldi.</li>
            <li>• Tu ci dai solo il permesso di farli lavorare.</li>
            <li>• Puoi chiudere tutto e andartene quando vuoi. È la libertà finanziaria definitiva.</li>
          </ul>
        </div>

        {/* Colonna destra: LIVE OPERATIONS + flusso 4 step */}
        <div className="space-y-4">
          {/* Live Operations widget */}
          <LiveOperationsFeed />

          {/* Flusso operativo in 4 step */}
          <motion.div
            variants={fadeInUp}
            className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl"
          >
            <h3 className="text-sm font-semibold text-white/80">
              Flusso operativo in 4 step:
            </h3>
            <ol className="space-y-3 text-sm text-white/70">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[11px] font-semibold text-emerald-300">
                  1
                </span>
                <div>
                  <p className="font-medium text-white/80">Crea il Conto</p>
                  <p>Registrati in 30 secondi.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[11px] font-semibold text-emerald-300">
                  2
                </span>
                <div>
                  <p className="font-medium text-white/80">Carica Energia</p>
                  <p>Deposita il capitale che vuoi far lavorare (Euro o Carta).</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[11px] font-semibold text-emerald-300">
                  3
                </span>
                <div>
                  <p className="font-medium text-white/80">Accendi Cerbero</p>
                  <p>Attiva l&apos;Autotrading e torna alla tua vita.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[11px] font-semibold text-emerald-300">
                  4
                </span>
                <div>
                  <p className="font-medium text-white/80">Goditi i Risultati</p>
                  <p>Guarda il saldo crescere e preleva i guadagni direttamente in banca.</p>
                </div>
              </li>
            </ol>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ----------------------- LIVE OPERATIONS WIDGET ------------------------ */

function LiveOperationsFeed() {
  return (
    <motion.div
      variants={fadeIn}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-slate-900/70 to-sky-500/15 p-4 backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between text-[11px] text-white/70">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          Live Operations Feed
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100/80">
          Always On
        </span>
      </div>

      {/* Fade top/bottom */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-slate-950 via-slate-950/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

      <div className="relative h-44 overflow-hidden">
        <motion.div
          className="flex flex-col gap-2"
          animate={{ y: ['0%', '-50%'] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {[...liveFeedData, ...liveFeedData].map((item, idx) => (
            <div
              key={`${item.symbol}-${item.time}-${idx}`}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-black/50 px-3 py-2 text-[11px] text-white/70 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/85">
                    {item.type} • {item.symbol}
                  </span>
                  <span className="text-[10px] text-white/60">{item.action}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className={`text-[11px] ${
                    item.type === 'PROFIT'
                      ? 'text-emerald-300'
                      : item.type === 'ENTRY'
                      ? 'text-white'
                      : 'text-sky-300'
                  }`}
                >
                  {item.value}
                </span>
                <span className="text-[9px] text-white/45">{item.time}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* --------------------------- PRICING SECTION ---------------------------- */

function PricingSection() {
  return (
    <motion.section
      id="pricing"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-600/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-sky-100/90"
      >
        Pricing
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="flex flex-col items-center gap-8 text-center"
      >
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            <span>UN SOLO ABBONAMENTO.</span>
            <span className="block bg-gradient-to-r from-[#00F0FF] to-[#BC13FE] bg-clip-text text-transparent">
              ACCESSO TOTALE.
            </span>
          </h2>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            Nessuna commissione nascosta sui profitti. Nessuna sorpresa.
            Con una quota fissa mensile, ottieni la stessa tecnologia usata dai grandi fondi d&apos;investimento.
            Se Cerbero ti fa guadagnare 1.000€ o 10.000€, il prezzo per te non cambia.
          </p>
        </div>

        <motion.div
          variants={fadeIn}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950 to-sky-950/70 p-6 shadow-[0_0_45px_rgba(56,189,248,0.45)] backdrop-blur-2xl"
        >
          <div className="mb-6 flex items-baseline justify-center gap-2">
            <span className="text-4xl font-semibold text-white">99€</span>
            <span className="text-xs text-white/60">/ mese</span>
          </div>

          <ul className="mb-6 space-y-2 text-left text-sm text-white/70">
            <li className="flex gap-2">
              <span className="mt-0.5">🔵</span>
              <span>Autotrading illimitato 24/7.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">🔵</span>
              <span>Wallet personale dedicato incluso.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">🔵</span>
              <span>Prelievi rapidi in Euro.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">🔵</span>
              <span>Report fiscale automatico per semplificare la dichiarazione.</span>
            </li>
          </ul>

          <div className="flex flex-col gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold shadow-[0_0_35px_rgba(59,130,246,0.7)] transition hover:brightness-110"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #00eaff, #9b6cff, #ec38ff)',
                }}
              >
                Inizia a guadagnare ora
              </Link>
            </motion.div>
            <p className="text-[11px] text-white/50">
              Pagamento gestito tramite Stripe. Dopo l&apos;attivazione vieni portato
              direttamente nella dashboard per configurare il tuo wallet.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

/* ------------------------------ FOOTER ---------------------------------- */

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-gradient-to-b from-black/40 via-black/80 to-black/95 pt-8 pb-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row md:items-start">
        {/* Logo + claim */}
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
            <span className="text-[11px] text-white/60">
              © 2025 Cerbero. All rights reserved.
            </span>
          </div>
        </div>

        {/* Powered by + legal */}
        <div className="flex flex-col items-center gap-4 md:items-end">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/60 md:justify-end">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Powered by
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              Google Cloud
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              Arbitrum One
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              USDC (Circle)
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              Gains Network (GNS)
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-white/60 md:justify-end">
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
