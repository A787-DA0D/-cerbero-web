"use client";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-10 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Privacy Policy – Cerbero AI
          </h1>
          <p className="text-sm text-white/70">
            2026-02-18
          </p>
        </header>

        {/* 1 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            1. Introduction
          </h2>
          <p>
            This Privacy Policy explains how Cerbero AI (“Company”, “we”, “us”)
            collects, uses, and protects personal data when you access or use
            cerberoai.com and related services.
          </p>
        </section>

        {/* 2 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            2. Data We Collect
          </h2>
          <p>We may collect the following categories of data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email address (for authentication and communication);</li>
            <li>Account-related identifiers;</li>
            <li>Broker connection metadata (e.g., platform type, account ID via MetaApi);</li>
            <li>Usage data and technical logs;</li>
            <li>Subscription status and billing metadata.</li>
          </ul>
          <p>
            Cerbero AI does not collect or store broker withdrawal credentials
            or financial account passwords beyond what is strictly necessary for
            API-based connection.
          </p>
        </section>

        {/* 3 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            3. How We Use Data
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and operate the AI trading infrastructure;</li>
            <li>To authenticate users securely;</li>
            <li>To manage subscriptions and billing;</li>
            <li>To monitor system performance and prevent abuse;</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        {/* 4 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            4. Legal Basis (GDPR)
          </h2>
          <p>
            Where applicable under the General Data Protection Regulation (GDPR),
            data processing is based on:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contractual necessity;</li>
            <li>Legitimate interest;</li>
            <li>Legal obligations;</li>
            <li>User consent where required.</li>
          </ul>
        </section>

        {/* 5 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            5. Third-Party Services
          </h2>
          <p>
            Cerbero AI relies on selected third-party providers including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>MetaApi (broker account connectivity);</li>
            <li>Cloud hosting providers;</li>
            <li>Stripe (subscription billing);</li>
            <li>Resend (authentication email delivery);</li>
            <li>Analytics tools (where applicable).</li>
          </ul>
          <p>
            These providers may process limited personal data strictly for
            service delivery purposes.
          </p>
        </section>

        {/* 6 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            6. Data Storage & Security
          </h2>
          <p>
            We implement technical and organizational safeguards to protect
            personal data against unauthorized access, alteration, or loss.
          </p>
          <p>
            However, no online system can guarantee absolute security.
          </p>
        </section>

        {/* 7 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            7. Data Retention
          </h2>
          <p>
            Personal data is retained only for as long as necessary to fulfill
            service obligations, comply with legal requirements, and resolve
            disputes.
          </p>
        </section>

        {/* 8 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            8. User Rights
          </h2>
          <p>Depending on jurisdiction, users may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access their personal data;</li>
            <li>Request correction or deletion;</li>
            <li>Restrict processing;</li>
            <li>Request data portability;</li>
            <li>Withdraw consent where applicable.</li>
          </ul>
        </section>

        {/* 9 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            9. International Transfers
          </h2>
          <p>
            Data may be processed in jurisdictions outside the User’s country of
            residence where our infrastructure providers operate.
          </p>
        </section>

        {/* 10 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            10. Changes to This Policy
          </h2>
          <p>
            We reserve the right to update this Privacy Policy at any time.
            Continued use of the Platform constitutes acceptance of any
            modifications.
          </p>
        </section>

        {/* 11 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            11. Contact
          </h2>
          <p>
            For privacy-related inquiries, please contact:
          </p>
          <p className="font-medium">
            support@cerberoai.com
          </p>
        </section>
      </div>
    </main>
  );
}
