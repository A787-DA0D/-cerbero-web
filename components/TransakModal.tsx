"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type TransakModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transakUrl: string | null;
  mode: "BUY" | "SELL";
};

export function TransakModal({
  isOpen,
  onClose,
  transakUrl,
  mode,
}: TransakModalProps) {
  if (!isOpen || !transakUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* close by clicking outside */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          className="relative z-50 w-[95%] max-w-3xl h-[80vh] rounded-3xl bg-neutral-950 border border-white/10 overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <span className="text-sm font-medium text-white/80">
              {mode === "BUY"
                ? "Ricarica fondi con Transak (STAGING)"
                : "Prelievo fondi (SELL) via Transak (STAGING)"}
            </span>
            <button
              onClick={onClose}
              className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/70 hover:bg-white/10"
            >
              Chiudi
            </button>
          </div>

          <iframe
            src={transakUrl}
            className="w-full h-[calc(80vh-3rem)] border-0"
            allow="camera;microphone;fullscreen;payment"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
