"use client";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-10 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Cookies Policy – Cerbero AI
          </h1>
          <p className="text-sm text-white/70">
            2026-02-18
          </p>
        </header>

        {/* 1 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            1. What Are Cookies
          </h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help improve user experience, enable functionality,
            and provide analytical insights.
          </p>
        </section>

        {/* 2 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            2. How Cerbero AI Uses Cookies
          </h2>
          <p>
            Cerbero AI uses cookies and similar technologies strictly for
            operational and security purposes.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Authentication and session management;</li>
            <li>Security and fraud prevention;</li>
            <li>Performance monitoring;</li>
            <li>Preference storage (where applicable).</li>
          </ul>
        </section>

        {/* 3 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            3. Types of Cookies We May Use
          </h2>

          <h3 className="font-medium text-white/90 mt-2">
            Essential Cookies
          </h3>
          <p>
            Required for the website to function properly, including secure login
            and dashboard access.
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            Performance Cookies
          </h3>
          <p>
            Help us understand how users interact with the platform to improve
            reliability and usability.
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            Security Cookies
          </h3>
          <p>
            Used to protect against unauthorized access, session hijacking,
            and malicious activity.
          </p>
        </section>

        {/* 4 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            4. Third-Party Cookies
          </h2>
          <p>
            Certain third-party service providers (e.g., authentication,
            billing, hosting, analytics) may set cookies necessary for their
            services to operate correctly.
          </p>
        </section>

        {/* 5 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            5. Managing Cookies
          </h2>
          <p>
            You may control or delete cookies through your browser settings.
            Disabling essential cookies may limit access to certain features of
            the Platform.
          </p>
        </section>

        {/* 6 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            6. Changes to This Policy
          </h2>
          <p>
            We may update this Cookies Policy from time to time. Continued use
            of the Platform constitutes acceptance of any modifications.
          </p>
        </section>

        {/* 7 */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            7. Contact
          </h2>
          <p>
            For questions regarding this Cookies Policy, contact:
          </p>
          <p className="font-medium">
            support@cerberoai.com
          </p>
        </section>
      </div>
    </main>
  );
}
