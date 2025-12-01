"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cerbero_cookie_consent_v1";

type ConsentValue = "accepted" | "rejected";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (value: ConsentValue) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-start gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="text-xs sm:text-sm text-white/80">
          <p className="font-semibold">Cookie &amp; privacy</p>
          <p className="mt-1 text-[11px] sm:text-xs text-white/60">
            Usiamo cookie tecnici per far funzionare il sito e, solo se ci
            autorizzi, cookie di analisi anonimi. Puoi leggere i dettagli
            nella{" "}
            <a
              href="/legal/cookies"
              className="underline hover:text-white"
            >
              Cookie Policy
            </a>{" "}
            e nella{" "}
            <a
              href="/legal/privacy"
              className="underline hover:text-white"
            >
              Privacy Policy
            </a>.
          </p>
        </div>

        <div className="ml-auto flex shrink-0 gap-2">
          <button
            onClick={() => handleChoice("rejected")}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Rifiuta
          </button>
          <button
            onClick={() => handleChoice("accepted")}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
