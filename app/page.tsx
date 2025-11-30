"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import FooterLegal from "@/components/FooterLegal";

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

// NAVBAR futuristica con menu desktop + CTA (stile Pricing)
const Nav = () => {
  return (
    <motion.header
      className="sticky top-0 z-30 px-4 sm:px-6 lg:px-12 pt-4 pb-3"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/15 bg-black/70 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_18px_60px_rgba(0,0,0,0.75)]">
        {/* Logo + nome */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-3 group">
            <Image
              src="/branding/cerbero-logo.svg"
              alt="Cerbero AI logo"
              width={44}
              height={44}
              className="drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
            />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold">
                Cerbero <span className="text-sky-400">AI</span>
              </span>
              <span className="text-[11px] text-white/60 group-hover:text-white/80 transition">
                Switch On. Sit back. Relax.
              </span>
            </div>
          </a>
        </div>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm md:text-base font-semibold">
          {/* Siamo già in Home → niente link dedicato, ci pensa il logo */}
          <a
            href="/pricing"
            className="text-white/70 hover:text-white transition"
          >
            Pricing
          </a>
          <a
            href="/trust"
            className="text-white/70 hover:text-white transition"
          >
            Come funziona
          </a>
        </nav>

        {/* CTA destra */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/signup"
            className="inline-flex items-center rounded-full border border-white/30 bg-white/5 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Registrati
          </a>
          <a
            href="/login"
            className="inline-flex items-center rounded-full bg-white text-slate-900 text-xs md:text-sm font-semibold px-4 py-2 shadow-[0_10px_35px_rgba(15,23,42,0.9)] hover:bg-slate-100 transition"
          >
            Accedi
          </a>
        </div>
      </div>
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
        {/* Titolo principale */}
        <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-semibold leading-tight tracking-tight">
          Cerbero — Switch On.
          <br />
          <span className="text-white/90">Sit back and Relax.</span>
        </h1>

        {/* Sottotitolo */}
        <p className="max-w-xl text-sm sm:text-base text-white font-bold leading-relaxed">
          Attivi l&apos;Autopilot, colleghi il tuo portafoglio digitale e la
          Coscienza AI si occupa dei mercati al posto tuo. Il capitale resta
          sempre al sicuro sotto il tuo controllo, tu ti concentri su tutto il
          resto.
        </p>

        {/* CTA principali */}
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold bg-white text-[#050816] hover:opacity-90 transition shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
          >
            Attiva Autopilot 99€/mese
          </a>
          <a
            href="/trust"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium border border-white/40 bg-black/70 text-white hover:bg-black/80 transition shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
          >
            Come funziona
          </a>
        </div>

        {/* Disclaimer breve */}
        <p className="text-xs text-white/45 max-w-md pt-1">
          Nessuna consulenza finanziaria. Il capitale resta sempre nel tuo
          portafoglio digitale dedicato.
        </p>
      </motion.div>

      {/* Colonna destra: Cerbero Index card */}
      <motion.div
        className="relative"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.15}
      >
        <motion.div
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 sm:p-6 lg:p-7 shadow-[0_22px_70px_rgba(0,0,0,0.75)]"
          whileHover={{ y: -6, boxShadow: "0 26px 80px rgba(0,0,0,0.9)" }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-sky-400">
                Cerbero Index
              </p>
              <p className="text-sm text-white/80">Coming soon</p>
            </div>
            <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              Preview
            </button>
          </div>

          {/* Placeholder grafico - barre che “salgono” */}
          <div className="h-40 sm:h-44 rounded-2xl bg-black/40 border border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 flex items-end gap-[3px] px-4">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-400/20 via-cyan-400/80 to-white"
                  initial={{ height: 30 + (i % 10) * 5 }}
                  animate={{
                    height: [
                      40 + (i % 10) * 5,
                      90 + (i % 10) * 5,
                      40 + (i % 10) * 5,
                    ],
                  }}
                  transition={{
                    duration: 3 + (i % 5) * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.03,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#050816]/95 to-transparent" />
          </div>

          {/* Pilloline sotto grafico */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[11px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-white/50 mb-1">Modo</div>
              <div className="text-white/85 font-medium">Autopilot</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-white/50 mb-1">Focus</div>
              <div className="text-white/85 font-medium">Euro-in / Euro-out</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
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
    title="Perché Cerbero AI"
    subtitle="Non devi diventare trader. Devi solo accendere la Coscienza AI e lasciare che operi sul capitale nel tuo portafoglio digitale, che resta sempre sotto il tuo controllo."
  >
    <div className="grid md:grid-cols-3 gap-5">
      {/* Card 1 - Autopilot */}
      <Card delay={0.05}>
        <div className="text-sm text-sky-400 mb-1 font-medium">
          Autopilot · 99€/mese
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Coscienza AI sempre attiva
        </h3>
        <p className="text-sm text-white font-semibold leading-relaxed">
          Cerbero monitora i mercati in tempo reale, apre e chiude operazioni,
          tu vedi tutto, puoi mettere in pausa quando vuoi dal Wallet.
        </p>
      </Card>

      {/* Card 2 - Portafoglio personale */}
      <Card delay={0.12}>
        <div className="text-sm text-sky-400 mb-1 font-medium">
          Portafoglio personale
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Il tuo portafoglio digitale personale
        </h3>
        <p className="text-sm text-white font-semibold leading-relaxed">
          Il capitale è in un portafoglio digitale personale collegato a
          Cerbero. La Coscienza AI può operare sui mercati, ma le chiavi
          restano tue. Tu decidi quando depositare, mettere in pausa o
          prelevare.
        </p>
      </Card>

      {/* Card 3 - Tecnologia verificabile */}
      <Card delay={0.18}>
        <div className="text-sm text-sky-400 mb-1 font-medium">
          Tecnologia verificabile
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Infrastruttura, non promesse
        </h3>
        <p className="text-sm text-white font-semibold leading-relaxed">
          Google Cloud per l&apos;infrastruttura, Arbitrum One + USDC native
          on-chain, esecuzione su Gains Network. Ogni componente è tracciabile,
          osservabile e verificabile in modo indipendente.
        </p>
      </Card>
    </div>
  </Section>
);

function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-gradient-to-b from-black/40 via-black/80 to-black/95 px-4 sm:px-6 lg:px-12 py-8">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Logo + claim */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center">
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
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 text-[11px] text-white/60">
            <span className="uppercase tracking-[0.18em] text-[10px] text-white/40">
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

          <div className="flex flex-wrap justify-center md:justify-end gap-4 text-[11px] text-white/60">
            <a href="/legal/privacy" className="hover:text-white transition">
              Privacy
            </a>
            <a href="/legal/terms" className="hover:text-white transition">
              Termini &amp; Condizioni
            </a>
            <a href="/legal/cookies" className="hover:text-white transition">
              Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
