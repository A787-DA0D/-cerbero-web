'use client';

import React, { useEffect, useMemo, useState } from 'react';

type DeferredPromptEvent = Event & {
  prompt?: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function cx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

function isIOS() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
}

function isAndroid() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /Android/i.test(ua);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  // iOS Safari:
  const iosStandalone = (window.navigator as any).standalone === true;
  // Other browsers:
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches;
  return Boolean(iosStandalone || displayModeStandalone);
}

export default function InstallAppSection() {
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const ios = useMemo(() => isIOS(), []);
  const android = useMemo(() => isAndroid(), []);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBeforeInstallPrompt = (e: Event) => {
      // Chrome/Edge Android: possiamo intercettare e decidere quando aprire il prompt
      e.preventDefault?.();
      setDeferredPrompt(e as DeferredPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const installAndroid = async () => {
    if (!deferredPrompt?.prompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice?.catch(() => null);
    } finally {
      // dopo un prompt la maggior parte dei browser invalida l’evento
      setDeferredPrompt(null);
    }
  };

  if (installed) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-[40px] border border-white/60 bg-white/70 backdrop-blur-[20px] p-10 md:p-14 shadow-[0_8px_32px_rgba(31,38,135,0.06)] text-center">
          <div className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-3">App pronta</div>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Cerbero AI è installato ✅</h3>
          <p className="text-slate-600">
            Apri Cerbero dalla tua schermata Home per un’esperienza full app (standalone).
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Get the App</div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          Installa Cerbero sul tuo telefono
        </h3>
        <p className="text-slate-600">
          Un tap e hai Cerbero come un’app: più veloce, full screen, sempre a portata di mano.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* iOS */}
        <div className="rounded-[32px] border border-white/70 bg-white/80 backdrop-blur-[20px] p-8 shadow-[0_10px_40px_-20px_rgba(99,102,241,0.25)]">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">iPhone / iPad</div>
              <div className="text-2xl font-extrabold text-slate-900">Installa su iOS</div>
            </div>
            <div className="text-3xl"></div>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Su Safari puoi aggiungere Cerbero alla Home e aprirlo come app.
          </p>

          <button
            type="button"
            onClick={() => setIosHelpOpen(true)}
            className={cx(
              'w-full inline-flex items-center justify-center rounded-2xl px-6 py-4 font-extrabold text-white shadow-xl transition active:scale-[0.98]',
              'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
            )}
          >
            Installa su iPhone
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Tip: funziona meglio con Safari (non Chrome iOS).
          </p>
        </div>

        {/* Android */}
        <div className="rounded-[32px] border border-white/70 bg-white/80 backdrop-blur-[20px] p-8 shadow-[0_10px_40px_-20px_rgba(236,72,153,0.18)]">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Android</div>
              <div className="text-2xl font-extrabold text-slate-900">Installa su Android</div>
            </div>
            <div className="text-3xl">🤖</div>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Se sei su Chrome, puoi installare con un click.
          </p>

          {deferredPrompt ? (
            <button
              type="button"
              onClick={installAndroid}
              className={cx(
                'w-full inline-flex items-center justify-center rounded-2xl px-6 py-4 font-extrabold text-white shadow-xl transition active:scale-[0.98]',
                'bg-gradient-to-r from-slate-900 to-slate-800'
              )}
            >
              Installa su Android
            </button>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
              <div className="text-sm font-bold text-slate-900 mb-2">Installazione manuale</div>
              <ol className="text-sm text-slate-600 list-decimal pl-5 space-y-1">
                <li>Apri questo sito in <strong>Chrome</strong></li>
                <li>Menu ⋮</li>
                <li><strong>Installa app</strong> / <strong>Aggiungi a schermata Home</strong></li>
              </ol>
              {!android && (
                <div className="mt-3 text-xs text-slate-500">
                  (Sembra che tu non sia su Android in questo momento.)
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Se non appare il bottone, è normale: dipende dal browser.
          </p>
        </div>
      </div>

      {/* iOS overlay */}
      {iosHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIosHelpOpen(false)} />
          <div className="relative w-full max-w-lg rounded-[28px] bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Installazione iOS</div>
                <div className="text-2xl font-extrabold text-slate-900">Aggiungi Cerbero alla Home</div>
              </div>
              <button
                type="button"
                onClick={() => setIosHelpOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-1">1) Tocca Condividi</div>
                <div className="text-sm text-slate-600">
                  In Safari premi l’icona <strong>Condividi</strong> (quadrato con freccia).
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-1">2) Aggiungi a schermata Home</div>
                <div className="text-sm text-slate-600">
                  Scorri e seleziona <strong>Aggiungi a schermata Home</strong>, poi <strong>Aggiungi</strong>.
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Nota: su iOS il “prompt installazione” automatico non esiste come Android.
              </div>

              {!ios && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Sembra che tu non sia su iPhone/iPad adesso: queste istruzioni sono per Safari iOS.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
