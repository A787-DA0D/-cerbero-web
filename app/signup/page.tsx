"use client";

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#060814] via-[#0b1224] to-[#0f172a] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-8 md:p-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
          Crea il tuo account Cerbero
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Inizia con la Workstation 3.0. Potrai sempre passare da Pilot ad Autopilot
          (o viceversa) in un secondo momento.
        </p>

        <form className="grid md:grid-cols-2 gap-8">
          {/* Colonna sinistra: dati utente */}
          <div className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Nome e cognome
              </label>
              <input
                type="text"
                placeholder="Mario Rossi"
                className="w-full rounded-2xl bg-black/30 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
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
                className="w-full rounded-2xl bg-black/30 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Crea una password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-black/30 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          {/* Colonna destra: piano + consenso */}
          <div className="space-y-6">
            {/* Piano */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-white/80">
                Scegli il pilota (piano)
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-2xl bg-black/30 border border-white/20 px-4 py-3 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    defaultChecked
                    className="h-4 w-4"
                  />
                  <div className="text-sm">
                    <div className="font-semibold">Pilot – 40€/mese</div>
                    <div className="text-white/60 text-xs">
                      Workstation 3.0 con Copilota AI, trading manuale assistito.
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-2xl bg-black/30 border border-emerald-400/60 px-4 py-3 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    className="h-4 w-4"
                  />
                  <div className="text-sm">
                    <div className="font-semibold">Autopilot – 80€/mese</div>
                    <div className="text-white/60 text-xs">
                      Tutto il piano Pilot + Coscienza AI always-on e autotrading.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Consenso legale (solo checkbox UI) */}
            <div className="space-y-3 text-xs text-white/60">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-3 w-3 rounded border-white/30 bg-black/40"
                />
                <span>
                  Confermo di aver letto e accettato termini, privacy e rischi del
                  servizio. Capisco che il trading comporta possibilità di perdita.
                </span>
              </label>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-white text-[#0a1020] text-sm font-semibold py-3 hover:opacity-90 transition mt-2"
            >
              Crea account e continua
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
