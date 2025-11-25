"use client";

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#050816] via-[#050816] to-[#020617] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl p-8 md:p-10 shadow-[0_35px_120px_rgba(0,0,0,0.75)]">
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
          Attiva il tuo account Cerbero
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Un unico piano, nessuna confusione:{" "}
          <span className="font-semibold text-white">Autopilot 80€/mese</span>.  
          La Coscienza AI gestisce i mercati al posto tuo, tu continui la tua vita.
        </p>

        <form className="grid md:grid-cols-2 gap-8">
          {/* Colonna sinistra: dati utente base */}
          <div className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Nome e cognome
              </label>
              <input
                type="text"
                placeholder="Mario Rossi"
                className="w-full rounded-2xl bg-black/40 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Email
              </label>
              <input
                type="email"
                placeholder="nome@esempio.com"
                className="w-full rounded-2xl bg-black/40 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
              />
              <p className="text-[11px] text-white/45">
                Usiamo Magic Link per il login: nessuna password da ricordare, solo
                la tua email.
              </p>
            </div>
          </div>

          {/* Colonna destra: piano + consenso */}
          <div className="space-y-6">
            {/* Piano (solo Autopilot) */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-white/80">
                Piano attivo
              </div>
              <div className="rounded-2xl bg-black/40 border border-emerald-400/60 px-4 py-4">
                <div className="text-sm font-semibold flex items-baseline justify-between mb-1">
                  <span>Autopilot</span>
                  <span className="text-emerald-300 text-xs font-medium">
                    80€/mese
                  </span>
                </div>
                <p className="text-white/60 text-xs mb-3">
                  La Coscienza AI always-on monitora i mercati, esegue operazioni
                  secondo i parametri definiti e ti lascia il controllo
                  dell&apos;interruttore ON/OFF.
                </p>
                <ul className="text-[11px] text-white/70 space-y-1.5">
                  <li>• Autotrading completo gestito dalla Coscienza AI</li>
                  <li>• Monitoraggio continuo 24/7</li>
                  <li>• Scudi di protezione e gestione del rischio</li>
                  <li>• Dashboard dedicata con saldo, P&amp;L e operazioni</li>
                </ul>
              </div>
            </div>

            {/* Consenso legale (solo UI) */}
            <div className="space-y-3 text-xs text-white/60">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-3 w-3 rounded border-white/30 bg-black/40"
                />
                <span>
                  Confermo di aver letto e accettato termini, privacy e rischi del
                  servizio. Capisco che il trading comporta possibilità di
                  perdita di capitale.
                </span>
              </label>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-white text-[#0a1020] text-sm font-semibold py-3 hover:opacity-90 transition mt-2"
            >
              Crea account e vai al pagamento
            </button>

            <div className="text-xs text-white/60 text-center md:text-left">
              Hai già un account?{" "}
              <a href="/login" className="text-white hover:opacity-80 font-medium">
                Accedi
              </a>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
