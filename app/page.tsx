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
    ink: "#0a1020",
    kaya: "#0f1b3d",
    glass: "rgba(255,255,255,0.1)",
    paper: "#ffffff",
    mist: "#f5f7fb",
    accent: "#4f7cff",
    accent2: "#22d3ee",
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

// motion
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// —————————————————————————————————————————————————————————
// SHELL con video
// —————————————————————————————————————————————————————————
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative min-h-screen w-full overflow-hidden text-white"
    style={{ fontFamily: ui.fonts.body }}
  >
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/videos/landing-bg.mp4"
      autoPlay
      loop
      muted
      playsInline
    />
    <div className="relative z-10 min-h-screen">{children}</div>
  </div>
);

// —————————————————————————————————————————————————————————
// NAVBAR + MOBILE MENU
// —————————————————————————————————————————————————————————
const Nav = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <motion.header
      className={`sticky top-0 z-30 ${ui.spacing.gutterX} pt-4 pb-3`}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/15 bg-black/60 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <Image
            src="/branding/cerbero-logo.svg"
            alt="Cerbero logo"
            width={40}
            height={40}
            className="drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-base md:text-lg font-semibold tracking-tight">
              Cerbero <span className="text-sky-300">AI</span>
            </span>
            <span className="text-[10px] md:text-[11px] text-white/50">
              Switch On. Sit back and Relax.
            </span>
          </div>
        </a>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <a href="/" className="text-white hover:text-sky-300 transition">Home</a>
          <a href="/pricing" className="text-white/80 hover:text-sky-300 transition">Pricing</a>
          <a href="/trust" className="text-white/80 hover:text-sky-300 transition">Come funziona</a>
        </nav>

        {/* DESKTOP CTA */}
        <div className="hidden md:flex items-center gap-2">
          <a href="/signup" className="rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition">
            Registrati
          </a>
          <a href="/login" className="rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition">
            Accedi
          </a>
        </div>

        {/* MOBILE TRIGGER */}
        <button
          type="button"
          className="md:hidden inline-flex flex-col items-center justify-center rounded-full border border-white/30 bg-black/60 p-2 active:scale-95 transition"
          onClick={() => setIsMobileOpen((v) => !v)}
        >
          <span className="h-1 w-1 rounded-full bg-white mb-0.5" />
          <span className="h-1 w-1 rounded-full bg-white mb-0.5" />
          <span className="h-1 w-1 rounded-full bg-white" />
        </button>
      </div>

      {/* MENU MOBILE */}
      {isMobileOpen && (
        <motion.nav
          className="md:hidden mt-3 mx-auto max-w-7xl rounded-3xl border border-white/15 bg-black/85 backdrop-blur-2xl px-4 py-4 space-y-3 text-sm text-white/90 shadow-[0_18px_60px_rgba(0,0,0,0.75)]"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <a href="/" onClick={() => setIsMobileOpen(false)} className="block px-2 py-2 rounded-xl hover:bg-white/10 font-semibold">Home</a>
          <a href="/pricing" onClick={() => setIsMobileOpen(false)} className="block px-2 py-2 rounded-xl hover:bg-white/10 font-semibold">Pricing</a>
          <a href="/come-funziona" onClick={() => setIsMobileOpen(false)} className="block px-2 py-2 rounded-xl hover:bg-white/10 font-semibold">Come funziona</a>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <a href="/signup" className="w-full rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition">Registrati</a>
            <a href="/login" className="w-full rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition">Accedi</a>
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
};

// CARD
const Card = ({ children, delay = 0 }: any) => (
  <motion.div
    className="rounded-3xl p-6 bg-black/70 backdrop-blur-xl border border-white/15"
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

// HERO
const Hero = () => (
  <section id="landing" className={`${ui.spacing.gutterX} pb-24 pt-10 md:pt-16 lg:pt-20`}>
    <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] items-center">
      {/* COLONNA TESTO */}
      <motion.div
        className="space-y-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.05}
      >
        <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-semibold leading-tight tracking-tight">
          Cerbero — Switch On.<br />
          <span className="text-white/90">Sit back and Relax.</span>
        </h1>

        <p className="max-w-xl text-sm sm:text-base text-white font-bold">
          Cerbero AI non è un bot: è una piattaforma basata su{" "}
          <span className="text-sky-300">tre Intelligenze Artificiali unite sotto una Coscienza</span>{" "}
          progettata per i mercati. Analizza e opera su{" "}
          <span className="text-sky-300">forex, oro, petrolio e cripto</span>,
          adattandosi in tempo reale come un sistema ispirato agli hedge fund, ma con i fondi sempre nel tuo{" "}
          <span className="text-sky-300">portafoglio digitale personale</span>.
          <br />
          Tu vivi. Cerbero lavora.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold bg-white text-[#050816] hover:opacity-90 transition shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
          >
            Attiva Autopilot 99€/mese
          </a>

          <a
            href="/come-funziona"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium border border-white/40 bg-black/70 text-white hover:bg-black/80 transition shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
          >
            Come funziona
          </a>
        </div>

        <p className="text-xs text-white/45 max-w-md pt-1">
          Nessuna consulenza finanziaria. Il capitale resta sempre nel tuo portafoglio digitale dedicato.
        </p>
      </motion.div>

      {/* COLONNA DESTRA – INDEX */}
      <motion.div className="relative" variants={fadeUp} initial="hidden" animate="visible" custom={0.15}>
        <motion.div
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 sm:p-6 lg:p-7 shadow-[0_22px_70px_rgba(0,0,0,0.75)]"
          whileHover={{ y: -6, boxShadow: "0 26px 80px rgba(0,0,0,0.9)" }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-sky-400">Cerbero Index</p>
              <p className="text-sm text-white/80">Coming soon</p>
            </div>
            <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              Preview
            </button>
          </div>

          {/* BARRE GRAPH */}
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
/* =======================================================================================
   SEZIONE “PERCHÉ CERBERO AI”
======================================================================================= */

const ValueSection = () => (
  <section id="value" className="px-4 sm:px-6 lg:px-12 py-24">
    <h2 className="text-3xl md:text-4xl font-bold mb-6">
      Perché Cerbero <span className="text-sky-300">AI</span>
    </h2>

    <p className="text-white text-base max-w-2xl mb-12 font-bold">
      Non devi diventare trader. Devi solo accendere la Coscienza AI e lasciare che operi
      sul capitale nel tuo portafoglio digitale, che resta sempre sotto il tuo controllo.
    </p>

    <div className="grid md:grid-cols-3 gap-6">
      {/* Card 1 */}
      <Card delay={0.05}>
        <div className="text-sm text-sky-400 mb-1 font-medium">
          Autopilot · 99€/mese
        </div>
        <h3 className="text-lg font-semibold mb-2">Coscienza AI sempre attiva</h3>
        <p className="text-sm text-white font-bold leading-relaxed">
          Cerbero monitora i mercati in tempo reale, apre e chiude operazioni. Tu vedi tutto
          dalla dashboard e puoi mettere l’Autopilot in pausa quando vuoi.
        </p>
      </Card>

      {/* Card 2 */}
      <Card delay={0.12}>
        <div className="text-sm text-sky-400 mb-1 font-medium">
          Portafoglio personale
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Il tuo portafoglio digitale personale
        </h3>
        <p className="text-sm text-white font-semibold leading-relaxed">
          I fondi sono separati e intestati solo a te sul tuo smart contract dedicato. Le chiavi
          restano tue. Depositi, metti in pausa o prelevi quando vuoi.
        </p>
      </Card>

      {/* Card 3 */}
      <Card delay={0.18}>
        <div className="text-sm text-sky-400 mb-1 font-medium">
          Tecnologia verificabile
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Infrastruttura, non promesse
        </h3>
        <p className="text-sm text-white font-bold leading-relaxed">
          Google Cloud per l’infrastruttura, Arbitrum One + USDC native on-chain, esecuzione su Gains Network.
          Tutto tracciabile, osservabile e verificabile.
        </p>
      </Card>
    </div>
  </section>
);


/* =======================================================================================
   FOOTER — identico a Pricing e Come Funziona
======================================================================================= */

const Footer = () => (
  <footer className="mt-24 border-t border-white/10 bg-gradient-to-b from-black/40 via-black/80 to-black/95 px-4 sm:px-6 lg:px-12 py-10">
    <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image
          src="/branding/cerbero-logo.svg"
          alt="Cerbero AI logo"
          width={40}
          height={40}
          className="drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">
            Cerbero <span className="text-sky-400">AI</span>
          </span>
          <span className="text-[11px] text-white/60">
            © 2025 Cerbero. All rights reserved.
          </span>
        </div>
      </div>

      {/* Powered by */}
      <div className="flex flex-col items-center md:items-end gap-4">
        <div className="flex flex-wrap justify-center md:justify-end gap-2 text-[11px] text-white/60">
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
          <a href="/legal/privacy" className="hover:text-white transition">Privacy</a>
          <a href="/legal/terms" className="hover:text-white transition">Termini & Condizioni</a>
          <a href="/legal/cookies" className="hover:text-white transition">Cookie</a>
        </div>
      </div>

    </div>
  </footer>
);


/* =======================================================================================
   ROOT EXPORT
======================================================================================= */

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
