"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import Image from "next/image";
import { motion } from "framer-motion";

// Tipo per la risposta di /api/me
type MeResponse = {
  ok: boolean;
  email: string | null;
  wallet: string | null;
  sub: string | null;
};

// Mock P&L mese (in futuro prenderemo il dato reale)
const PNL_MONTHLY = 4.5;

// Colore glow in base al P&L
function getGlowColor(pnl: number) {
  if (pnl > 0) return "#22d3ee"; // ciano/verde
  if (pnl < 0) return "#fb7185"; // rosso
  return "#e5e7eb"; // neutro
}

// ———————————————————————————————————————
// Orb 3D: C del logo sempre frontale + leggero movimento
// ———————————————————————————————————————
function CerberoOrb3D() {
  const texture = useLoader(TextureLoader, "/cerbero-logo-clean.png");
  const meshRef = useRef<any>(null);
  const glowColor = getGlowColor(PNL_MONTHLY);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!meshRef.current) return;

    // leggero “respiro” e fluttuazione,
    // ma senza mai girare troppo la faccia verso il lato
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.08;
    meshRef.current.rotation.x = Math.cos(t * 0.4) * 0.06;
    meshRef.current.position.y = Math.sin(t * 0.9) * 0.05;
    meshRef.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.03);
  });

  return (
    <>
      {/* disco di glow dietro */}
      <mesh>
        <circleGeometry args={[1.5, 64]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.18} />
      </mesh>

      {/* piano con logo C, quasi sempre frontale */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshStandardMaterial
          map={texture}
          transparent
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>

      {/* halo leggero intorno */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.55, 64]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.7}
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}

export default function DashboardPage() {
  // Stato sessione utente (da /api/me)
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // leggiamo il token dal localStorage (solo client-side)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("cerbero_session")
        : null;

    // se non c'è token → via alla login
    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error("invalid session");
        }

        setMe(data);
      } catch (err) {
        console.error("[dashboard] /api/me error:", err);
        // puliamo il token e rimandiamo a login
        if (typeof window !== "undefined") {
          localStorage.removeItem("cerbero_session");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const glowColor = getGlowColor(PNL_MONTHLY);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#050816] via-[#071329] to-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10">
          <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
            <Image
              src="/cerbero-logo-clean.png"
              alt="Cerbero logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="text-sm font-semibold tracking-tight">
            Cerbero <span className="text-white/50">App</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 text-sm text-white/70">
          <button className="w-full flex items-center justify-between rounded-2xl px-3 py-2 bg-white/10 text-white font-semibold">
            <span>Dashboard</span>
          </button>
          <a
            href="/wallet"
            className="w-full flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-white/5 font-semibold"
          >
            <span>Wallet</span>
          </a>
          <button className="w-full flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-white/5 font-semibold">
            <span>Account</span>
            {/* in futuro: link a /account */}
          </button>
        </nav>

        <div className="px-4 pb-6 text-[11px] text-white/40">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <div className="font-semibold text-xs mb-1">Piano attivo</div>
            <div className="text-xs">Autopilot • 80€/mese</div>
          </div>
        </div>
      </aside>

      {/* Contenuto principale */}
      <section className="flex-1 px-4 md:px-8 py-6 md:py-8">
        {/* Banner stato sessione (email + wallet) */}
        {loading && (
          <div className="w-full flex justify-center py-4 mb-4 text-sm text-white/60">
            Sto caricando il tuo account...
          </div>
        )}

        {!loading && me && (
          <div className="w-full flex items-center justify-between gap-4 mb-6 text-xs md:text-sm text-white/70 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <div className="flex flex-col">
              <span className="uppercase tracking-[0.2em] text-[10px] text-white/40">
                Utente collegato
              </span>
              <span className="font-medium">
                {me.email || "utente senza email"}
              </span>
            </div>
            <div className="text-right">
              <span className="uppercase tracking-[0.2em] text-[10px] text-white/40">
                Wallet Magic
              </span>
              <div className="font-mono text-[11px] md:text-xs">
                {me.wallet
                  ? `${me.wallet.slice(0, 6)}…${me.wallet.slice(-4)}`
                  : "non disponibile"}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Benvenuto in Cerbero
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Il tuo reattore AI per il capitale: saldo, stato dell&apos;Autopilot
              e operatività in un unico pannello.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-2xl bg-emerald-500/10 text-emerald-300 px-3 py-1 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              🟢 Coscienza AI attiva
            </div>
            <div className="rounded-2xl bg-white/5 px-3 py-1 border border-white/10 text-white/70">
              Piano: <span className="font-semibold text-white">Autopilot</span>
            </div>
          </div>
        </header>

        {/* Blocco principale: Orb + metriche */}
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)] gap-6 mb-8">
          {/* Orb / Coscienza */}
          <motion.section
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/70 via-[#020617] to-slate-950/60 px-6 py-6 shadow-[0_26px_80px_rgba(0,0,0,0.9)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* glow di sfondo reagente al P&L */}
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -top-20 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full blur-3xl"
                style={{ backgroundColor: glowColor }}
                animate={{ opacity: [0.25, 0.75, 0.25] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {/* Orb 3D */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative h-52 w-52 md:h-56 md:w-56">
                  <Canvas
                    camera={{ position: [0, 0, 3] }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "9999px",
                    }}
                  >
                    <ambientLight intensity={0.5} />
                    <pointLight
                      position={[3, 3, 3]}
                      intensity={1.2}
                      color={glowColor}
                    />
                    <CerberoOrb3D />
                  </Canvas>

                  {/* alone extra */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-full border border-white/10"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Stato e controlli */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Coscienza · Stato
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Autotrading attivo
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    La Coscienza AI sta monitorando i mercati in tempo reale e
                    gestisce le operazioni secondo i parametri definiti.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* interruttore finto, ma vivo */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/50">AUTOPILOT</span>
                    <div className="relative w-14 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/70 flex items-center px-1">
                      <motion.div
                        className="h-5 w-5 rounded-full bg-white"
                        animate={{ x: [0, 14] }}
                        transition={{
                          duration: 1.3,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300">
                      ON
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-white/60">
                    <div>
                      Modalità rischio:{" "}
                      <span className="text-white">Bilanciata</span>
                    </div>
                    <div>
                      Ultimo sync:{" "}
                      <span className="text-emerald-300">pochi secondi fa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Metriche principali */}
          <motion.section
            className="grid gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {/* Saldo totale */}
            <motion.div
              className="rounded-3xl bg-white/5 border border-white/10 p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <div className="text-xs text-white/60 mb-1">
                Saldo totale (demo)
              </div>
              <div className="text-2xl font-semibold mb-1">€ 12.480</div>
              <div className="text-xs text-emerald-400">
                +€ 540 questo mese • trend positivo controllato
              </div>
            </motion.div>

            {/* P&L mese */}
            <motion.div
              className="rounded-3xl bg-white/5 border border-white/10 p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="text-xs text-white/60 mb-1">P&amp;L mese</div>
              <div
                className={`text-2xl font-semibold mb-1 ${
                  PNL_MONTHLY >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {PNL_MONTHLY >= 0 ? "+" : ""}
                {PNL_MONTHLY}%
              </div>
              <div className="text-xs text-white/60">
                Equity in crescita rispetto al mese scorso.
              </div>
            </motion.div>

            {/* Stato pilota */}
            <motion.div
              className="rounded-3xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs text-white/60">Stato pilota</div>
                  <div className="text-sm font-semibold mt-1">Autopilot</div>
                </div>
                <div className="text-[11px] rounded-full bg-emerald-500/10 border border-emerald-400/50 px-3 py-1 text-emerald-300">
                  Always-on
                </div>
              </div>
              <p className="text-xs text-white/60">
                La Coscienza gestisce le operazioni in autonomia; tu puoi
                intervenire in ogni momento da qui o dal Wallet.
              </p>
            </motion.div>
          </motion.section>
        </div>

        {/* Azioni principali */}
        <motion.div
          className="flex flex-wrap items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button className="rounded-2xl bg-white text-[#020617] text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition">
            Carica fondi
          </button>
          <button className="rounded-2xl border border-white/40 text-sm font-semibold px-5 py-2.5 hover:bg-white/5 transition">
            Preleva
          </button>
          <span className="text-xs text-white/50">
            Il tuo capitale resta sempre nel tuo smart contract 1-a-1.
          </span>
        </motion.div>

        {/* Operazioni recenti (mock) */}
        <motion.section
          className="rounded-3xl bg-white/5 border border-white/10 p-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Operazioni recenti</h2>
            <span className="text-[11px] text-white/50">
              Dati dimostrativi • v1 preview
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead className="text-white/50 text-[11px]">
                <tr>
                  <th className="text-left pr-4">Data</th>
                  <th className="text-left pr-4">Mercato</th>
                  <th className="text-left pr-4">Tipo</th>
                  <th className="text-left pr-4">Esito</th>
                  <th className="text-right">P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: "17 Nov, 09:32",
                    market: "EURUSD",
                    type: "Autotrade",
                    outcome: "Take Profit",
                    pnl: "+€120",
                  },
                  {
                    date: "16 Nov, 15:11",
                    market: "NAS100",
                    type: "Autotrade",
                    outcome: "Gestione multi-target",
                    pnl: "+€65",
                  },
                  {
                    date: "16 Nov, 10:05",
                    market: "XAUUSD",
                    type: "Autotrade",
                    outcome: "Stop protetto",
                    pnl: "-€40",
                  },
                ].map((row, i) => (
                  <tr key={i} className="bg-black/20">
                    <td className="rounded-l-2xl px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">{row.market}</td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.outcome}</td>
                    <td className="rounded-r-2xl px-3 py-2 text-right">
                      <span
                        className={
                          row.pnl.startsWith("+")
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {row.pnl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </section>
    </main>
  );
}
