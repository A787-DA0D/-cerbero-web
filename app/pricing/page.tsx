"use client";

import Image from "next/image";

// Cerbero Web v1 — Pagina Pricing (Pilot vs Autopilot)

const ui = {
  fonts: {
    body:
      "Inter, Plus Jakarta Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="min-h-screen w-full bg-gradient-to-b from-[#0a1020] via-[#0e1731] to-white text-white"
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

const Section = ({ children }: { children: React.ReactNode }) => (
  <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
    <div className="mx-auto max-w-6xl">{children}</div>
  </section>
);

// Navbar (stile simile alla landing, con "Pricing" evidenziato)
const Nav = () => (
  <header className="sticky top-0 z-30 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4">
    <div className="mx-auto max-w-7xl flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Image
          src="/cerbero-logo.png"
          alt="Cerbero logo"
          width={150}
          height={150}
          className="object-contain invert brightness-0"
        />
        <div className="text-xl md:text-2xl font-semibold tracking-tight">
          Cerbero <span className="text-white/60">AI</span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
        <a href="/" className="hover:text-white transition">
          Home
        </a>
        <span className="text-white font-semibold">Pricing</span>
        <a href="/trust" className="hover:text-white transition">
          Come funziona
        </a>
        <a href="/login" className="hover:text-white transition">
          Login
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <a
          href="/signup"
          className="hidden sm:inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-white text-[#0a1020] hover:opacity-90 transition"
        >
          Inizia ora
        </a>
      </div>
    </div>
  </header>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
    {children}
  </span>
);

const PlanCard = ({
  title,
  price,
  description,
  features,
  highlight,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  ctaLabel: string;
  ctaHref: string;
}) => (
  <div
    className={`relative rounded-3xl p-6 md:p-8 bg-white/10 backdrop-blur-xl border ${
      highlight
        ? "border-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
        : "border-white/15 shadow-[0_12px_35px_rgba(0,0,0,0.35)]"
    }`}
  >
    {highlight && (
      <div className="absolute -top-3 right-6 rounded-full bg-emerald-400 text-[#0a1020] text-xs font-semibold px-3 py-1 shadow-lg">
        Più scelto
      </div>
    )}

    <div className="mb-4 flex items-baseline gap-2">
      <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
    </div>

    <div className="mb-4">
      <span className="text-3xl md:text-4xl font-semibold">{price}</span>
      <span className="text-sm text-white/60"> /mese</span>
    </div>

    <p className="text-sm text-white/80 mb-6">{description}</p>

    <ul className="space-y-2 text-sm text-white/80 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    <a
      href={ctaHref}
      className={`inline-flex justify-center w-full rounded-2xl px-4 py-3 text-sm font-medium transition ${
        highlight
          ? "bg-white text-[#0a1020] hover:opacity-90"
          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
      }`}
    >
      {ctaLabel}
    </a>
  </div>
);

const Footer = () => (
  <footer className="px-4 sm:px-6 lg:px-8 py-10 border-t border-white/10 bg-gradient-to-b from-transparent to-white/5">
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
              <a className="hover:underline text-white/80" href="/">
                Home
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

// Pagina principale /pricing
export default function PricingPage() {
  return (
    <Shell>
      <Nav />

      <Section>
        <div className="text-center mb-10">
          <div className="mb-3 inline-flex items-center gap-2 justify-center">
            <Badge>Scegli il tuo pilota</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Pricing semplice. Pilot o Autopilot.
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            Inizi con la Workstation 3.0, poi decidi se lasciare il volante
            alla Coscienza AI. Nessun vincolo annuale, cancelli quando vuoi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <PlanCard
            title="Pilot"
            price="40€"
            description="Per chi vuole restare al volante ma con un copilota AI accanto."
            features={[
              "Accesso completo alla Workstation 3.0",
              "Copilota AI con analisi e probabilità",
              "Equity e performance in tempo reale",
              "Autotrading visibile ma bloccato (lucchetto)",
            ]}
            ctaLabel="Inizia con Pilot"
            ctaHref="/signup?plan=pilot"
          />

          <PlanCard
            title="Autopilot"
            price="80€"
            description="Per chi vuole accendere la Coscienza AI e lasciare che lavori 24/7."
            features={[
              "Tutto ciò che include il piano Pilot",
              "Autotrading completo gestito dalla Coscienza",
              "Scudi di protezione e controllo del rischio",
              "Interruttore AUTOTRADING ON/OFF sempre visibile",
            ]}
            highlight
            ctaLabel="Attiva Autopilot"
            ctaHref="/signup?plan=autopilot"
          />
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/15 px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-emerald-300 font-semibold mb-1">
              Incluso in entrambi i piani
            </div>
            <div className="text-base md:text-lg font-semibold">
              Ponte 1-a-1: i tuoi soldi, il tuo contratto.
            </div>
            <p className="text-xs md:text-sm text-white/70 mt-2 max-w-xl">
              I fondi passano dalla banca alla tua cassaforte personale su
              blockchain. Noi abbiamo il telecomando operativo, ma non le chiavi
              per spostare il capitale fuori dal tuo contratto.
            </p>
          </div>
          <a
            href="/trust"
            className="inline-flex rounded-2xl px-4 py-2 text-xs md:text-sm font-medium bg-white/10 border border-white/20 hover:bg-white/20 transition"
          >
            Scopri come funziona
          </a>
        </div>
      </Section>

      <Footer />
    </Shell>
  );
}
