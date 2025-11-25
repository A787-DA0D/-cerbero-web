"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Cerbero Web v1 — Landing futurizzata (Hero + Valore + Cerbero Index)

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

// Shell di base con background gradient
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="min-h-screen w-full bg-gradient-to-b from-[#050816] via-[#070b1c] to-black text-white"
    style={{ fontFamily: ui.fonts.body }}
  >
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <div
        className="absolute -top-32 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(closest-side, #22d3ee, transparent)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(closest-side, #4f7cff, transparent)",
        }}
      />
    </div>
    <div className="relative">{children}</div>
  </div>
);

// NAVBAR futuristica con menu mobile
const Nav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className={`${ui.spacing.gutterX} pt-4 pb-3 sticky top-0 z-30`}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl rounded-3xl border border-white/15 bg-white/5/60 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
      >
        {/* Logo + nome */}
        <div className="flex items-center gap-2">
          <Image
            src="/cerbero-logo.png"
            alt="Cerbero logo"
            width={150}
            height={150}
            className="object-contain invert brightness-0"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-base md:text-lg font-semibold tracking-tight">
              Cerbero <span className="text-white/60">AI</span>
            </span>
            <span className="text-[10px] md:text-[11px] text-white/50">
              Switch On. Sit back and Relax.
            </span>
          </div>
        </div>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
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
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-white text-[#0a1020] hover:opacity-90 transition shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            Attiva Autotrading
          </a>

          {/* Burger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 p-2 active:scale-95 transition"
            aria-label="Apri menu"
          >
            <span className="w-4 h-[1.5px] bg-white block mb-1" />
            <span className="w-4 h-[1.5px] bg-white block mb-1" />
            <span className="w-4 h-[1.5px] bg-white block" />
          </button>
        </div>
      </motion.div>

      {/* Pannello mobile */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-auto max-w-7xl mt-3 rounded-3xl border border-white/15 bg-black/70 backdrop-blur-2xl px-4 py-4 text-sm text-white/80 space-y-2 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
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
            className="mt-2 inline-flex w-full justify-center rounded-2xl bg-white text-[#0a1020] font-medium px-4 py-2.5 hover:opacity-90 transition"
            onClick={() => setOpen(false)}
          >
            Attiva Cerbero
          </a>
        </motion.div>
      )}
    </header>
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
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-white/70 max-w-2xl">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-3xl p-6 bg-white/10 backdrop-blur-xl border border-white/15 ${className}`}
    style={{ boxShadow: ui.shadow.glass }}
  >
    {children}
  </div>
);

// —————————————————————————————————————————————————————————
// HERO futurizzato
// —————————————————————————————————————————————————————————
const Hero = () => (
  <section
    id="landing"
    className={`${ui.spacing.gutterX} pb-24 pt-10 md:pt-16 lg:pt-20`}
  >
    <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] items-center">
      {/* Colonna sinistra: testo + CTA */}
      <div className="space-y-6">
        {/* Badge sopra il titolo */}
        <motion.div
          className="flex flex-wrap gap-2 text-xs text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">
            AI Wealth Management
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">
            Autotrading su Arbitrum One
          </span>
        </motion.div>

        {/* Titolo principale */}
        <motion.h1
          className="text-3xl sm:text-4xl lg:text-[2.8rem] font-semibold leading-tight tracking-tight"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Cerbero — Switch On.
          <br />
          <span className="text-white/90">Sit back and Relax.</span>
        </motion.h1>

        {/* Sottotitolo */}
        <motion.p
          className="max-w-xl text-sm sm:text-base text-white/70"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Accendi Cerbero, attivi l’Autopilot e lasci che la Coscienza AI gestisca
          i mercati al posto tuo. Tu continui la tua vita, noi ci occupiamo del
          rumore.
        </motion.p>

        {/* CTA principali */}
        <motion.div
          className="flex flex-wrap gap-3 pt-1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <a
            href="/pricing"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold bg-white text-[#050816] hover:opacity-90 transition shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
          >
            Attiva Autopilot 80€/mese
          </a>
          <a
            href="/trust"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium border border-white/20 bg-white/5 text-white hover:bg-white/10 transition"
          >
            Come funziona
          </a>
        </motion.div>

        {/* Disclaimer breve */}
        <motion.p
          className="text-xs text-white/45 max-w-md pt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Nessuna consulenza finanziaria. Il capitale è sempre nel tuo smart
          contract 1-a-1.
        </motion.p>

        {/* Striscia partner */}
        <motion.div
          className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-white/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <span className="uppercase tracking-[0.18em] text-[10px] text-white/40">
            Powered by
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Google Cloud
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Arbitrum One
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            USDC (Circle)
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Gains Network (GNS)
          </span>
        </motion.div>
      </div>

      {/* Colonna destra: Cerbero Index card + halo */}
      <div className="relative">
        {/* Halo orb dietro la card */}
        <motion.div
          className="pointer-events-none absolute -top-10 -right-6 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        <motion.div
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 sm:p-6 lg:p-7 shadow-[0_22px_70px_rgba(0,0,0,0.75)]"
          initial={{ opacity: 0, y: 24, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
          whileHover={{ y: -4, scale: 1.01 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                Cerbero Index
              </p>
              <p className="text-sm text-white/80">Coming soon</p>
            </div>
            <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              Preview
            </button>
          </div>

          {/* Placeholder grafico */}
          <div className="h-40 sm:h-44 rounded-2xl bg-black/40 border border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 opacity-60">
              <div className="flex h-full items-end gap-[3px] px-4">
                {Array.from({ length: 32 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-400/10 via-cyan-400/60 to-white/90"
                    style={{
                      height: `${20 + ((i * 37) % 60)}%`,
                    }}
                    animate={{
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.03,
                    }}
                  />
                ))}
              </div>
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
      </div>
    </div>
  </section>
);

// —————————————————————————————————————————————————————————
// SEZIONE VALORE (perché Cerbero)
// —————————————————————————————————————————————————————————
const ValueSection = () => (
  <Section
    id="value"
    title="Perché Cerbero"
    subtitle="Non devi diventare trader. Devi solo accendere l’Autopilot e lasciare che la Coscienza lavori per te."
  >
    <div className="grid md:grid-cols-3 gap-5">
      <Card>
        <div className="text-sm text-white/70 mb-2">Autopilot 80€/mese</div>
        <h3 className="text-lg font-semibold mb-2">Coscienza AI always-on</h3>
        <p className="text-sm text-white/75">
          Autotrading completo: monitoraggio continuo, esecuzione disciplinata e
          interruttore ON/OFF sempre sotto il tuo controllo.
        </p>
      </Card>
      <Card>
        <div className="text-sm text-white/70 mb-2">Smart contract 1-a-1</div>
        <h3 className="text-lg font-semibold mb-2">
          Il tuo capitale, la tua cassaforte
        </h3>
        <p className="text-sm text-white/75">
          I fondi vivono nel tuo smart contract dedicato. Cerbero può solo
          operare secondo le regole che hai approvato, non toccare il saldo.
        </p>
      </Card>
      <Card>
        <div className="text-sm text-white/70 mb-2">AI-native</div>
        <h3 className="text-lg font-semibold mb-2">
          Costruito per i mercati 24/7
        </h3>
        <p className="text-sm text-white/75">
          La Coscienza non dorme: ascolta il flusso dei mercati, filtra il rumore
          e reagisce secondo parametri probabilistici, non emozionali.
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
          <div className="w-9 h-9 rounded-2xl grid place-items-center bg-white/10 border border-white/15">
            <span className="text-xl font-bold">C</span>
          </div>
          <div className="text-sm font-semibold">Cerbero AI</div>
        </div>
        <p className="mt-3 text-xs text-white/60">
          © {new Date().getFullYear()} Cerbero. All rights reserved.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-white/70 mb-2">Prodotto</div>
          <ul className="space-y-1">
            <li>
              <a className="hover:underline text-white/80" href="/pricing">
                Pricing
              </a>
            </li>
            <li>
              <a className="hover:underline text-white/80" href="/trust">
                Come funziona
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-white/70 mb-2">Account</div>
          <ul className="space-y-1">
            <li>
              <a className="hover:underline text-white/80" href="/login">
                Login
              </a>
            </li>
            <li>
              <a className="hover:underline text-white/80" href="/signup">
                Registrati
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-white/70 mb-2">Legal</div>
          <ul className="space-y-1">
            <li>
              <a className="hover:underline text-white/80" href="#">
                Privacy
              </a>
            </li>
            <li>
              <a className="hover:underline text-white/80" href="#">
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
