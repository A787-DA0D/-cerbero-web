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
            Ultimo aggiornamento: DD/MM/YYYY
          </p>
        </header>

        {/* ——— TESTO PRIVACY POLICY ——— */}
        <section className="space-y-4 text-sm leading-relaxed text-white/80">
          <p>
            La presente informativa descrive le modalità di trattamento dei dati personali
            effettuato tramite il sito <span className="font-medium">cerberoai.com</span> e
            la Piattaforma <span className="font-medium">Cerbero AI</span>.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            1. Titolare del Trattamento
          </h2>
          <p>
            Il trattamento dei dati personali effettuato tramite il sito{" "}
            <span className="font-medium">cerberoai.com</span> e la Piattaforma{" "}
            <span className="font-medium">Cerbero AI</span> è svolto dal Titolare del
            Trattamento (&quot;Titolare&quot;).
          </p>
          <p>
            Per informazioni o per l&apos;esercizio dei diritti privacy, è possibile
            contattare il Titolare all&apos;indirizzo:
            {" "}
            <a
              href="mailto:info@cerberoai.com"
              className="text-emerald-300 underline underline-offset-2"
            >
              info@cerberoai.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            2. Dati Personali Raccolti
          </h2>

          <h3 className="font-medium text-white/90 mt-2">
            Dati forniti direttamente dall&apos;Utente
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email e dati di registrazione.</li>
            <li>Dati di login tramite Magic.link.</li>
            <li>Eventuali informazioni fornite all&apos;assistenza.</li>
          </ul>

          <h3 className="font-medium text-white/90 mt-3">
            Dati tecnici e di utilizzo
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Indirizzo IP (anonimizzato quando possibile).</li>
            <li>Informazioni su dispositivo, browser, sistema operativo.</li>
            <li>Log tecnici, richieste API, eventi applicativi.</li>
          </ul>

          <h3 className="font-medium text-white/90 mt-3">
            Dati blockchain (non-custodial)
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Indirizzi wallet.</li>
            <li>Interazioni con smart contract.</li>
            <li>Transazioni on-chain associate all&apos;uso dell&apos;Autopilot.</li>
          </ul>
          <p className="italic text-white/70">
            Cerbero AI non tratta né può accedere a chiavi private, seed phrase o fondi
            dell&apos;Utente.
          </p>

          <h3 className="font-medium text-white/90 mt-3">Dati di pagamento (Stripe)</h3>
          <p>Gestiti direttamente da Stripe, tra cui:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>esito della transazione;</li>
            <li>stato dell&apos;abbonamento.</li>
          </ul>

          <h3 className="font-medium text-white/90 mt-3">
            Dati provenienti da servizi di on-ramp (Transak, Ramp)
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>wallet address;</li>
            <li>importo/asset acquistati;</li>
            <li>order ID e stato.</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            3. Finalità del Trattamento
          </h2>
          <p>I dati raccolti sono trattati per le seguenti finalità:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>funzionamento della Piattaforma (Autopilot, dashboard, smart contract dedicati);</li>
            <li>autenticazione tramite Magic.link;</li>
            <li>gestione dei pagamenti (Stripe);</li>
            <li>riconciliazione on-ramp (Transak/Ramp);</li>
            <li>sicurezza, prevenzione abusi e integrità del Servizio;</li>
            <li>assistenza clienti;</li>
            <li>analisi aggregate per miglioramento del Servizio;</li>
            <li>adempimenti normativi.</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            4. Base Giuridica del Trattamento
          </h2>
          <p>
            Il trattamento dei dati personali da parte del Titolare si fonda sulle
            seguenti basi giuridiche:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">
                Esecuzione del contratto (art. 6.1.b GDPR)
              </span>
              : necessaria per fornire l&apos;accesso alla Piattaforma e ai servizi connessi.
            </li>
            <li>
              <span className="font-medium">
                Obbligo legale (art. 6.1.c GDPR)
              </span>
              : adempimenti relativi a sicurezza, fatturazione e conservazione documentale.
            </li>
            <li>
              <span className="font-medium">
                Legittimo interesse del Titolare (art. 6.1.f GDPR)
              </span>
              : prevenzione abusi, misure anti-frodi, miglioramento della sicurezza e
              dell&apos;infrastruttura.
            </li>
            <li>
              <span className="font-medium">
                Consenso dell&apos;Utente (art. 6.1.a GDPR)
              </span>
              : esclusivamente per cookie non tecnici, strumenti di analytics non
              anonimizzati e funzionalità opzionali.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            5. Modalità e Durata della Conservazione
          </h2>
          <p>
            Il Titolare conserva i dati personali per periodi coerenti con le finalità del
            trattamento e nel rispetto dei principi di necessità, proporzionalità e
            limitazione della conservazione previsti dal GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">Dati dell&apos;account:</span> conservati per
              tutta la durata dell&apos;account e cancellati al momento della sua
              chiusura, salvo obblighi legali di conservazione.
            </li>
            <li>
              <span className="font-medium">Log tecnici e di sicurezza:</span> conservati
              per il tempo strettamente necessario alle finalità di sicurezza, monitoraggio,
              prevenzione abusi e rispetto degli obblighi legali.
            </li>
            <li>
              <span className="font-medium">Dati on-chain:</span> permanenti per la natura
              stessa della tecnologia blockchain, non modificabili né cancellabili dal
              Titolare.
            </li>
            <li>
              <span className="font-medium">Dati relativi ai pagamenti (Stripe):</span>{" "}
              conservati e trattati secondo le policy di Stripe, in qualità di autonomo
              titolare.
            </li>
            <li>
              <span className="font-medium">Cookie e strumenti analoghi:</span> conservati
              secondo la durata definita nel banner e nelle impostazioni del browser
              dell&apos;Utente.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            6. Destinatari dei Dati
          </h2>
          <p>I dati possono essere condivisi con:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Magic.link (autenticazione);</li>
            <li>Stripe (pagamenti);</li>
            <li>Transak e Ramp (on-ramp);</li>
            <li>Google Cloud (hosting e database);</li>
            <li>fornitori tecnici di sicurezza, logging e email transactional;</li>
            <li>consulenti legali/contabili quando necessario.</li>
          </ul>
          <p>
            Il Titolare <span className="font-medium">non vende né cede</span> dati
            personali a terzi per finalità commerciali.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            7. Trasferimenti Internazionali
          </h2>
          <p>
            Alcuni servizi possono comportare trasferimenti extra-UE (es. Stati Uniti).
            Tali trasferimenti avvengono tramite{" "}
            <span className="font-medium">Standard Contractual Clauses (SCC)</span> e
            misure tecniche aggiuntive, in conformità al GDPR.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            8. Sicurezza dei Dati
          </h2>
          <p>
            Il Titolare applica misure tecniche e organizzative adeguate per proteggere i
            dati da accessi non autorizzati o usi impropri. In caso di data breach, verrà
            effettuata notifica secondo quanto previsto dal GDPR.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            9. Diritti dell&apos;Utente
          </h2>
          <p>L&apos;Utente può in qualsiasi momento:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>accedere ai propri dati;</li>
            <li>richiederne rettifica o cancellazione;</li>
            <li>richiedere la limitazione del trattamento;</li>
            <li>opporsi al trattamento;</li>
            <li>richiedere la portabilità dei dati;</li>
            <li>revocare il consenso (ove applicabile).</li>
          </ul>
          <p>
            Le richieste possono essere inviate a{" "}
            <a
              href="mailto:info@cerberoai.com"
              className="text-emerald-300 underline underline-offset-2"
            >
              info@cerberoai.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            10. Minori
          </h2>
          <p>
            La Piattaforma non è destinata a soggetti minori di 18 anni. Se il Titolare
            viene a conoscenza del fatto che siano stati raccolti dati di minori, tali dati
            verranno cancellati ove possibile.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            11. Aggiornamenti alla Privacy Policy
          </h2>
          <p>
            La presente Privacy Policy può essere aggiornata per adeguamenti tecnici,
            legali o funzionali. La versione aggiornata sarà sempre disponibile sul sito{" "}
            <span className="font-medium">cerberoai.com</span>. In caso di modifiche
            rilevanti, potrà essere fornita un&apos;adeguata comunicazione agli Utenti.
          </p>
        </section>
      </div>
    </main>
  );
}
