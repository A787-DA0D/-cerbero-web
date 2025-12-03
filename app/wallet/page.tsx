"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TransakModal } from "@/components/TransakModal";
import { buildTransakUrl } from "@/lib/transak";

type MovementRow = {
  id: string;
  date: string;
  type: string;
  detail: string;
  chain: string;
  amount: string;
  isPositive: boolean;
};

function formatAddress(addr: string | null | undefined) {
  if (!addr || addr.length < 10) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatNumber(n: number, decimals = 2) {
  return n.toLocaleString("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function WalletPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);

  const [isTransakOpen, setIsTransakOpen] = useState(false);
  const [transakMode, setTransakMode] = useState<"BUY" | "SELL">("BUY");

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  const [balanceUSDC, setBalanceUSDC] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // /api/me
  useEffect(() => {
    const loadMe = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("cerbero_session")
          : null;

      if (!token) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data?.ok) throw new Error("invalid session");

        setUserEmail(data.email ?? null);
        setUserWallet(data.wallet ?? null);
      } catch (err) {
        console.error("[wallet] /api/me error:", err);
        if (typeof window !== "undefined") {
          localStorage.removeItem("cerbero_session");
          window.location.href = "/login";
        }
      }
    };

    loadMe();
  }, []);

  // /api/tenant/summary
  useEffect(() => {
    const loadBalance = async () => {
      if (!userEmail && !userWallet) return;

      setIsLoadingBalance(true);

      try {
        const params = new URLSearchParams();
        if (userEmail) params.set("email", userEmail);
        else if (userWallet) params.set("walletMagic", userWallet);

        const res = await fetch(`/api/tenant/summary?${params.toString()}`);

        if (!res.ok) {
          console.error("[/api/tenant/summary] non ok:", res.status);
          setIsLoadingBalance(false);
          return;
        }

        const data = await res.json();
        if (!data?.ok) {
          console.error("[/api/tenant/summary] risposta ko:", data);
          setIsLoadingBalance(false);
          return;
        }

        setBalanceUSDC(Number(data.balanceUSDC) || 0);
      } catch (err) {
        console.error("[/api/tenant/summary] errore fetch:", err);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadBalance();
  }, [userEmail, userWallet]);

  // /api/tenant/movements
  useEffect(() => {
    const loadMovements = async () => {
      if (!userEmail && !userWallet) return;

      setIsLoadingMovements(true);

      try {
        const params = new URLSearchParams();
        if (userEmail) params.set("email", userEmail);
        else if (userWallet) params.set("walletMagic", userWallet);

        const res = await fetch(`/api/tenant/movements?${params.toString()}`);

        if (!res.ok) {
          console.error("[/api/tenant/movements] non ok:", res.status);
          setIsLoadingMovements(false);
          return;
        }

        const data = await res.json();
        if (!data?.ok) {
          console.error("[/api/tenant/movements] risposta ko:", data);
          setIsLoadingMovements(false);
          return;
        }

        const rows: MovementRow[] = (data.movements || []).map((m: any) => {
          const createdAt = m.createdAt ? new Date(m.createdAt) : null;
          const dateStr = createdAt
            ? createdAt.toLocaleString("it-IT", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const isPositive = (m.rawAmount ?? 0) >= 0;

          return {
            id: m.id,
            date: dateStr,
            type: m.labelType || m.type || "Movimento",
            detail: m.detail || "Movimento saldo",
            chain:
              m.chain === "arbitrum_one" ? "Arbitrum" : m.chain || "Arbitrum",
            amount: m.amount,
            isPositive,
          };
        });

        setMovements(rows);
      } catch (err) {
        console.error("[/api/tenant/movements] errore fetch:", err);
      } finally {
        setIsLoadingMovements(false);
      }
    };

    loadMovements();
  }, [userEmail, userWallet]);

  // Transak URL dinamico
  const transakUrl = useMemo(() => {
    if (!userEmail || !userWallet) return null;

    return buildTransakUrl({
      email: userEmail,
      walletAddress: userWallet,
    });
  }, [userEmail, userWallet, transakMode]);

  const isCaricaFondiDisabled = !transakUrl;

  const displayBalanceUSDC =
    balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : "—";

  const displayBalanceEUR =
    balanceUSDC !== null ? formatNumber(balanceUSDC, 2) : "—";

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/wallet-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {/* HEADER */}
          <header className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center">
                <Image
                  src="/branding/cerbero-logo.svg"
                  alt="Cerbero AI logo"
                  width={36}
                  height={36}
                  className="drop-shadow-[0_0_22px_rgba(56,189,248,0.95)]"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight">
                  Cerbero <span className="text-cyan-300">AI</span>
                </span>
                <span className="text-[11px] text-white/60">
                  Capital Engine · Wallet
                </span>
              </div>
            </div>
          </header>

          {/* CARD + PARAMETRI */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)] mb-6">
            {/* SALDO */}
            <motion.section
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/70 via-[#020617] to-slate-950/70 px-6 py-5 shadow-[0_26px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Glow */}

              <div className="relative space-y-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
                  <span>Saldo operativo</span>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-400/40">
                    {isLoadingBalance
                      ? "Aggiornamento saldo…"
                      : "Dati live · Tenants"}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs text:white/50 mb-1">
                      Capitale su smart contract
                    </div>
                    <div className="text-4xl font-semibold tracking-tight">
                      {displayBalanceUSDC}{" "}
                      <span className="text-base font-normal text-white/60">
                        USDC
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-white/60 space-y-0.5">
                    <div>
                      Equivalente stimato:{" "}
                      <span className="text-white">
                        ≈ € {displayBalanceEUR}
                      </span>
                    </div>
                    <div>
                      Wallet:{" "}
                      <span className="font-mono text-[11px] text-white/80">
                        {formatAddress(userWallet)}
                      </span>
                    </div>
                    <div>
                      Rete:{" "}
                      <span className="text-emerald-300">Arbitrum One</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* PARAMETRI */}
            <motion.section
              className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.75)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <h3 className="text-sm font-semibold">Cassaforte personale</h3>
              <p className="mt-1 text-xs text-white/60">
                Lo smart contract è intestato a te. Cerbero può solo operare, non spostare fondi.
              </p>
            </motion.section>
          </div>

          {/* BOTTONI AZIONE */}
          <motion.div
            className="flex flex-wrap gap-2 mb-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* BUY */}
            <button
              onClick={() => {
                if (isCaricaFondiDisabled) return;
                setTransakMode("BUY");
                setIsTransakOpen(true);
              }}
              disabled={isCaricaFondiDisabled}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                isCaricaFondiDisabled
                  ? "bg-white/20 text-slate-400 cursor-not-allowed"
                  : "bg-white text-slate-950 hover:opacity-90"
              }`}
            >
              {isCaricaFondiDisabled
                ? "Carica fondi (attendi dati…)"
                : "Carica fondi"}
            </button>

            {/* SELL */}
            <button
              onClick={() => {
                if (isCaricaFondiDisabled) return;
                setTransakMode("SELL");
                setIsTransakOpen(true);
              }}
              disabled={isCaricaFondiDisabled}
              className="rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-400/40 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-500/20 transition"
            >
              Preleva
            </button>

            {/* Explorer */}
            <button className="rounded-2xl bg-white/5 text-white/80 border border-white/10 px-4 py-2.5 text-sm hover:bg-white/10 transition">
              Vedi su explorer
            </button>
          </motion.div>

          {/* MOVIMENTI */}
          <motion.section
            className="rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/50 to-black/70 px-5 py-5 shadow-[0_22px_70px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            {/* ...movimenti invariati... */}
          </motion.section>

          {/* MODAL TRANSAK */}
          <TransakModal
            isOpen={isTransakOpen}
            onClose={() => setIsTransakOpen(false)}
            transakUrl={transakUrl}
            mode={transakMode}
          />
        </div>
      </div>
    </main>
  );
}
