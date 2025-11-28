"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";

// Cerbero Web v1 — Landing futurizzata (Autopilot only)

// —————————————————————————————————————————————————————————
// UI KIT (tokens)
// —————————————————————————————————————————————————————————
const ui = {
  palette: {
    ink: "#0a1020", // deep navy
    kaya: "#0f1b3d", // darker navy
    glass: "rgba(255,255,255,0.1)",
    paper: "#ffffff",
    mist: "#f5f7fb",
    accent: "#4f7cff", // primary blue
    accent2: "#22d3ee", // cyan accent
    success: "#16a34a",
    warning: "#f59e0b",
    danger: "#ef4444",
    muted: "#8a93a6",
  },
  fonts: {
    heading:
      "Inter, Plus Jakarta Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    body: "Inter, Plus Jakarta Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  radius: {
    xl: "1.25rem",
    lg: "1rem",
    md: "0.75rem",
    sm: "0.5rem",
  },
  shadow: {
    soft: "0 10px 30px rgba(10,16,32,0.18)",
    glass:
      "inset 0 0 0 1px rgba(255,255,255,0.18), 0 8px 30px rgba(10,16,32,0.25)",
  },
  spacing: {
    sectionY: "py-16 md:py-24",
    gutterX: "px-4 sm:px-6 lg:px-8",
  },
};

// motion presets
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// —————————————————————————————————————————————————————————
// SHELL con VIDEO di sfondo
// —————————————————————————————————————————————————————————
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative min-h-screen w-full overflow-hidden text-white"
    style={{ fontFamily: ui.fonts.body }}
  >
    {/* VIDEO DI SFONDO */}
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/videos/landing-bg.mp4"
      autoPlay
      loop
      muted
      playsInline
    />

    {/* Contenuto sopra il video (senza overlay, solo pannelli glass) */}
    <div className="relative z-10 min-h-screen">
      {children}
    </div>
  </div>
);

// —————————————————————————————————————————————————————————
// NAVBAR futuristica con menu mobile
// —————————————————————————————————————————————————————————
const Nav = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      className={`sticky top-0 z-30 ${ui.spacing.gutterX} pt-4 pb-3`}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
        {/* Logo + nome */}
        <div className="flex items-center gap-3">
          <Image
            src="/branding/cerbero-logo.svg"
            alt="Cerbero logo"
            width={40}
            height={40}
            className="h-10 w-10 drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-base md:text-lg font-semibold tracking-tight">
              Cerbero <span className="text-cyan-300">AI</span>
            </span>
            <span className="text-[10px] md:text-[11px] text-white/60">
              Switch On. Sit back. Relax.
            </span>
          </div>
        </div>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm md:text-base font-semibold text-white/80">
          <a href="/" className="hover:text-white transition">
            Home
          </a>
          <a href="/pricing" className="hover:text-white transition">
            Pricing
          </a>
          <a href="/trust" className="hover:text-white transition">
            Come funziona
          </a>
          <a href="/login" className="hover:text-white transition">
            Login
          </a>
        </nav>

        {/* CTA + burger */}
        <div className="flex items-center gap-3">
          <a
            href="/pricing"
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-white text-[#0a1020] hover:opacity-90 transition shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
          >
            Attiva Autopilot
          </a>

          {/* Burger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/40 bg-black/60 p-2 active:scale-95 transition"
            aria-label="Apri menu"
          >
            <span className="w-4 h-[1.5px] bg-white block mb-1" />
            <span className="w-4 h-[1.5px] bg-white block mb-1" />
            <span className="w-4 h-[1.5px] bg-white block" />
          </button>
        </div>
      </div>

      {/* Pannello mobile */}
      {open && (
        <motion.div
          className="md:hidden mx-auto max-w-7xl mt-3 rounded-3xl border border-white/20 bg-black/80 backdrop-blur-2xl px-4 py-4 text-sm text-white/80 space-y-2 shadow-[0_18px_60px_rgba(0,0,0,0.8)]"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.05}
        >
          <a
            href="/"
            className="block px-2 py-2 rounded-xl hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Home
          </a>
          <a
            href="/pricing"
            className="block px-2 py-2 rounded-xl hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Pricing
          </a>
          <a
            href="/trust"
            className="block px-2 py-2 rounded-xl hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Come funziona
          </a>
          <a
            href="/login"
            className="block px-2 py-2 rounded-xl hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Login
          </a>

          <a
            href="/signup"
            className="mt-2 inline-flex w-full justify-center rounded-2xl bg-white text-[#0a1020] font-semibold px-4 py-2.5 hover:opacity-90 transition"
            onClick={() => setOpen(false)}
          >
            Attiva Autopilot
          </a>
        </motion.div>
      )}
    </motion.header>
  );
};

const Section = ({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className={`${ui.spacing.sectionY} ${ui.spacing.gutterX}`}>
    <div className="mx-auto max-w-7xl">
      {title && (
        <motion.div
          className="mb-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={0}
        >
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-white/90 font-semibold max-w-2xl">
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
      {children}
    </div>
  </section>
);

const Card = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={`rounded-3xl p-6 bg-black/70 backdrop-blur-xl border border-white/15 ${className}`}
    style={{ boxShadow: ui.shadow.glass }}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    custom={delay}
  >
    {children}
  </motion.div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
    {children}
  </span>
);

// —————————————————————————————————————————————————————————
// HERO
// —————————————————————————————————————————————————————————
const Hero = () => (
  <section
    id="landing"
    className={`${ui.spacing.gutterX} pb-24 pt-10 md:pt-16 lg:pt-20`}
  >
    <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] items-center">
      {/* Colonna sinistra: testo + CTA */}
      <motion.div
        className="space-y-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.05}
      >
        {/* Badge sopra il titolo */}
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          <span className="rounded-full bg-black/60 px-3 py-1 border border-white/15 backdrop-blur-xl">
            AI Wealth Management
          </span>
          <span className="rounded-full bg-black/60 px-3 py-1 border border-white/15 backdrop-blur-xl">
            Autotrading su Arbitrum One
          </span>
        </div>

        {/* Titolo principale */}
        <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-semibold leading-tight tracking-tight">
          Cerbero — Switch On.
          <br />
          <span className="text-white/90">Sit back and Relax.</span>
        </h1>

        {/* Sottotitolo */}
        <p className="max-w-xl text-sm sm:text;base text-white/90 font-semibold">
          Accendi Cerbero, attivi l&apos;Autopilot e lasci che la Coscienza AI
          operi sul tuo{" "}
          <span className="font-semibold">portafoglio digitale dedicato</span>{" "}
          secondo i parametri che imposti. Tu continui la tua vita, noi ci
          occupiamo del rumore.
        </p>

        {/* CTA principali */}
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="/pricing"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold bg-white text-[#050816] hover:opacity-90 transition shadow-[0_16px_40px_rgba(0,0,0,0.75)]"
          >
            Attiva Autopilot 99€/mese
          </a>
          <a
            href="/trust"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium border border-white/25 bg-black/60 text-white hover:bg-black/80 backdrop-blur-xl transition"
          >
            Come funziona
          </a>
        </div>

        {/* Disclaimer breve */}
        <p className="text-xs text-white/60 max-w-md pt-1">
          Nessuna consulenza finanziaria. Il capitale resta sempre nel tuo
          portafoglio digitale dedicato.
        </p>

        {/* Striscia partner */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-white/60">
          <span className="uppercase tracking-[0.18em] text-[10px] text-white/50">
            Powered by
          </span>

          <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-xl">
            Google Cloud
          </span>
          <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-xl">
            Arbitrum One
          </span>
          <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-xl">
            USDC (Circle)
          </span>
          <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-xl">
            Gains Network (GNS)
          </span>
        </div>
      </motion.div>

      {/* Colonna destra: Cerbero Index card (placeholder) */}
      <motion.div
        className="relative"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.15}
      >
        <motion.div
          className="rounded-3xl border border-white/15 bg-black/70 backdrop-blur-2xl p-5 sm:p-6 lg:p-7 shadow-[0_22px_70px_rgba(0,0,0,0.9)]"
          whileHover={{ y: -6, boxShadow: "0 26px 80px rgba(0,0,0,1)" }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <div className="flex items:center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">
                Cerbero Index
              </p>
              <p className="text-sm text-white/85">Coming soon</p>
            </div>
            <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/80">
              Preview
            </button>
          </div>

          {/* Placeholder grafico */}
          <div className="h-40 sm:h-44 rounded-2xl bg-black/60 border border-white/15 overflow-hidden relative">
            <div className="absolute inset-0 opacity-80">
              {/* Barre mock animate */}
              <motion.div
                className="flex h-full items-end gap-[3px] px-4"
                animate={{ x: ["0%", "-6%", "0%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-400/10 via-cyan-400/70 to-white/95"
                    style={{
                      height: `${20 + ((i * 37) % 60)}%`,
                    }}
                  />
                ))}
              </motion.div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#050816]/95 to-transparent" />
          </div>

          {/* Pilloline sotto grafico */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[11px]">
            <div className="rounded-2xl border border-white/15 bg-black/60 px-3 py-2">
              <div className="text-white/50 mb-1">Modo</div>
              <div className="text-white/90 font-medium">Autopilot</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/60 px-3 py-2">
              <div className="text-white/50 mb-1">Focus</div>
              <div className="text-white/90 font-medium">
                Euro-in / Euro-out
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/60 px-3 py-2">
              <div className="text-white/50 mb-1">Stato</div>
              <div className="text-emerald-400 font-medium">Pronto per v1</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// —————————————————————————————————————————————————————————
// SEZIONE VALORE (perché Cerbero) — solo Autopilot V1
// —————————————————————————————————————————————————————————
const ValueSection = () => (
  <Section
    id="value"
    title="Perché Cerbero"
    subtitle="Non devi diventare trader. Devi solo accendere la Coscienza AI e lasciare che operi sul capitale nel tuo portafoglio digitale, che resta sempre sotto il tuo controllo."
  >
    <div className="grid md:grid-cols-3 gap-5">
      <Card delay={0.05}>
        <div className="text-sm text-emerald-300 mb-1 font-medium">
          Autopilot · 99€/mese
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Coscienza AI always-on
        </h3>
        <p className="text-sm text-white/80">
          Cerbero monitora i mercati in tempo reale, apre e chiude operazioni
          secondo i parametri di rischio che imposti. Tu vedi tutto, puoi
          mettere in pausa quando vuoi dal Wallet.
        </p>
      </Card>

      <Card delay={0.12}>
        <div className="text-sm text-white/70 mb-1">Portafoglio dedicato</div>
        <h3 className="text-lg font-semibold mb-2">
          Il tuo portafoglio digitale personale
        </h3>
        <p className="text-sm text-white/80">
          I fondi passano dalla banca al tuo portafoglio digitale dedicato.
          Cerbero ha il telecomando operativo, non le chiavi per spostare i
          fondi. Puoi verificare tutto quando vuoi.
        </p>
      </Card>

      <Card delay={0.18}>
        <div className="text-sm text-white/70 mb-1">Stack verificabile</div>
        <h3 className="text-lg font-semibold mb-2">
          Infrastruttura, non promesse
        </h3>
        <p className="text-sm text-white/80">
          Google Cloud per l&apos;infrastruttura, Arbitrum One + USDC native
          on-chain, esecuzione su Gains Network. Tutto tracciabile,
          osservabile, auditabile.
        </p>
      </Card>
    </div>
  </Section>
);

// —————————————————————————————————————————————————————————
// FOOTER
// —————————————————————————————————————————————————————————
const Footer = () => (
  <footer
    className={`${ui.spacing.gutterX} py-10 border-t border-white/10 bg-gradient-to-b from-transparent to-white/5`}
  >
    <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center overflow-hidden">
            <Image
              src="/branding/cerbero-logo.svg"
              alt="Cerbero logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="text-sm font-semibold">
            Cerbero <span className="text-cyan-300">AI</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/60">
          © {new Date().getFullYear()} Cerbero. All rights reserved.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
        <div>
          <ul className="space-y-1">
            <li>
              <a
                className="hover:underline text-white/90 font-semibold"
                href="/pricing"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                className="hover:underline text-white/90 font-semibold"
                href="/trust"
              >
                Come funziona
              </a>
            </li>
          </ul>
        </div>

        <div>
          <ul className="space-y-1">
            <li>
              <a
                className="hover:underline text-white/90 font-semibold"
                href="/login"
              >
                Login
              </a>
            </li>
            <li>
              <a
                className="hover:underline text-white/90 font-semibold"
                href="/signup"
              >
                Registrati
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-white/70 mb-2">Legal</div>
          <ul className="space-y-1">
            <li>
              <a
                className="hover:underline text-white/90 font-semibold"
                href="#"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                className="hover:underline text-white/90 font-semibold"
                href="#"
              >
                Disclaimer
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

// —————————————————————————————————————————————————————————
// ROOT PAGE
// —————————————————————————————————————————————————————————
export default function CerberoLandingPage() {
  return (
    <Shell>
      <Nav />
      <Hero />
      <ValueSection />
      <Footer />
    </Shell>
  );
}
