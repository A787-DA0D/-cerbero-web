import Link from "next/link";

export default function FooterLegal() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60">
        <div className="space-y-1">
          <p className="font-medium text-white/80">
            Cerbero <span className="text-emerald-300">AI</span>
          </p>
          <p className="text-[11px]">
            © {year} Cerbero AI · Tutti i diritti riservati.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 md:gap-4 text-[11px]">
          <Link
            href="/legal/privacy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="opacity-40">·</span>
          <Link
            href="/legal/terms"
            className="hover:text-white transition-colors"
          >
            Termini &amp; Condizioni
          </Link>
          <span className="opacity-40">·</span>
          <Link
            href="/legal/cookies"
            className="hover:text-white transition-colors"
          >
            Cookie Policy
          </Link>
          <span className="opacity-40">·</span>
          <Link
            href="/legal/disclaimer"
            className="hover:text-white transition-colors"
          >
            Disclaimer finanziario
          </Link>
        </div>
      </div>
    </footer>
  );
}
