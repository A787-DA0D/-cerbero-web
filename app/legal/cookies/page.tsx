"use client";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-10 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Cookie Policy – Cerbero AI
          </h1>
          <p className="text-sm text-white/70">Ultimo aggiornamento: DD/MM/YYYY</p>
        </header>

        {/* INTRO */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <p>
            La presente Cookie Policy si applica al sito{" "}
            <span className="font-medium">cerberoai.com</span> e ai servizi erogati
            tramite la Piattaforma Cerbero AI.
          </p>
        </section>

        {/* COSA SONO */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            Cosa Sono i Cookie
          </h2>
          <p>
            I cookie sono piccoli file di testo installati sul dispositivo
            dell’Utente con finalità tecniche, funzionali o statistiche. Sono
            incluse tecnologie simili come pixel, local storage e SDK.
          </p>
        </section>

        {/* TIPI DI COOKIE */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            Tipologie di Cookie Utilizzati
          </h2>

          <h3 className="font-medium text-white/90 mt-3">Cookie Tecnici (Necessari)</h3>
          <p>Essenziali per:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>autenticazione tramite Magic.link;</li>
            <li>sicurezza e prevenzione abusi;</li>
            <li>gestione sessioni e preferenze.</li>
          </ul>
          <p className="text-white/70">Non richiedono consenso.</p>

          <h3 className="font-medium text-white/90 mt-3">Cookie di Analisi (Analytics)</h3>
          <p>
            Utilizzati per statistiche aggregate sull’utilizzo del Sito. Quando
            possibile, l’indirizzo IP viene anonimizzato.
          </p>
          <p>
            Se l’anonimizzazione non è applicata, è richiesto il consenso
            esplicito dell’Utente.
          </p>

          <h3 className="font-medium text-white/90 mt-3">Cookie di Funzionalità</h3>
          <p>
            Consentono funzionalità aggiuntive e preferenze non essenziali
            dell’interfaccia. Richiedono consenso.
          </p>

          <h3 className="font-medium text-white/90 mt-3">
            Cookie di Profilazione / Marketing
          </h3>
          <p>
            Non utilizzati di default. Eventuale introduzione richiederà
            aggiornamento del banner e nuovo consenso.
          </p>
        </section>

        {/* TERZE PARTI */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            Cookie di Terze Parti
          </h2>
          <p>Possono essere utilizzati da servizi integrati, tra cui:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Magic.link (autenticazione)</li>
            <li>Stripe (pagamenti)</li>
            <li></li>
            <li>Google Cloud Platform</li>
            <li>strumenti analytics</li>
          </ul>

          <p>
            Le loro cookie policy sono consultabili direttamente sui rispettivi
            siti ufficiali.
          </p>
        </section>

        {/* GESTIONE */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            Gestione delle Preferenze
          </h2>
          <p>L’Utente può:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>accettare o rifiutare cookie tramite il banner dedicato;</li>
            <li>modificare in qualsiasi momento le preferenze tramite apposito link;</li>
            <li>gestire o eliminare cookie tramite le impostazioni del browser.</li>
          </ul>

          <p className="text-white/70">
            La disattivazione dei cookie tecnici può compromettere il corretto
            funzionamento del Sito.
          </p>
        </section>

        {/* AGGIORNAMENTI */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            Aggiornamenti alla Cookie Policy
          </h2>
          <p>
            La presente Cookie Policy può essere aggiornata per ragioni tecniche,
            legali o funzionali. L’uso continuato del Sito implica accettazione
            delle eventuali modifiche.
          </p>
        </section>

        {/* CONTATTI */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">Contatti</h2>
          <p>
            Per domande relative alla privacy e ai cookie, è possibile contattare:
          </p>
          <p className="font-medium text-emerald-300">info@cerberoai.com</p>
        </section>
      </div>
    </main>
  );
}
