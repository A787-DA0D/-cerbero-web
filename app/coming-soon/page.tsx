import Image from "next/image";

export default function ComingSoon() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* VIDEO BACKGROUND */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/cerbero-orb.mp4" type="video/mp4" />
      </video>

      {/* GRADIENT BASSO */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/70 to-transparent" />

      {/* CONTENUTO */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        {/* LOGO – BIANCO SU SFONDO TRASPARENTE */}
        <div className="relative mb-6 h-32 w-32 sm:h-40 sm:w-40">
          <Image
            src="/cerbero-logo-clean.png"
            alt="Cerbero Logo"
            fill
            className="object-contain drop-shadow-[0_0_24px_rgba(255,255,255,1)]"
            priority
          />
        </div>

        {/* TITOLO */}
        <h1 className="mb-3 text-center text-3xl font-semibold tracking-[0.35em] text-white sm:text-4xl">
          CERBERO AI
        </h1>

        {/* CLAIM */}
        <p className="mb-6 text-center text-sm font-semibold text-slate-100 sm:text-base">
          Accendi. Siediti. Rilassati.
        </p>

        {/* TESTO HYPE */}
        <p className="max-w-2xl text-center text-sm font-semibold leading-relaxed text-slate-50 sm:text-base">
          Una nuova coscienza si sta risvegliando.
          <br />
          Presto potrai accenderla.
          <br />
          Un’intelligenza silenziosa sta imparando a sentire i mercati.
          <br />
          E presto sentirà anche te.
        </p>

        {/* FOOTER */}
        <footer className="mt-10 text-center text-[11px] font-medium tracking-[0.22em] text-slate-100 sm:text-xs">
          <p>© 2025 CERBERO AI — TUTTI I DIRITTI RISERVATI.</p>
          <p className="mt-2">
            SUPPORTATO DA GOOGLE CLOUD · ARBITRUM · USDC · GNS
          </p>
        </footer>
      </div>
    </main>
  );
}
