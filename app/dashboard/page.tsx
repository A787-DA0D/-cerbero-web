'use client';

import React from 'react';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-2">
          Cerbero Dashboard
        </p>
        <h1 className="text-2xl font-semibold sm:text-3xl mb-3">
          Area riservata in aggiornamento
        </h1>
        <p className="text-sm text-white/70">
          La nuova esperienza di Dashboard e Wallet è in fase di redesign.
          Per ora puoi esplorare la nuova Home e, appena sarà pronta, questa
          sezione si allineerà allo stesso livello grafico.
        </p>
      </div>
    </main>
  );
}
