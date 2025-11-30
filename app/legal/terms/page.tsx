"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-10 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Termini e Condizioni d&apos;Uso – Cerbero AI
          </h1>
          <p className="text-sm text-white/70">
            Ultimo aggiornamento: DD/MM/YYYY
          </p>
        </header>

        {/* 1. Definizioni */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            1. Definizioni
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">“Piattaforma” o “Servizio”</span>:
              indica Cerbero AI, accessibile tramite il sito{" "}
              <span className="font-medium">cerberoai.com</span> e relative
              interfacce applicative.
            </li>
            <li>
              <span className="font-medium">“Titolare”</span>: indica il gestore
              e fornitore della Piattaforma Cerbero AI.
            </li>
            <li>
              <span className="font-medium">“Utente”</span>: qualunque persona
              fisica o giuridica che accede, utilizza o interagisce con la
              Piattaforma.
            </li>
            <li>
              <span className="font-medium">“Autopilot”</span>: infrastruttura
              tecnologica automatizzata che consente il collegamento tra wallet
              non-custodial dell&apos;Utente e strategie algoritmiche di
              trading.
            </li>
            <li>
              <span className="font-medium">“Wallet non-custodial”</span>:
              portafoglio digitale di cui l&apos;Utente mantiene il controllo
              esclusivo, incluse chiavi private e credenziali.
            </li>
            <li>
              <span className="font-medium">“Terze Parti”</span>: soggetti
              diversi dal Titolare che forniscono infrastrutture, exchange,
              protocolli DeFi, blockchain, oracoli, servizi cloud o strumenti
              finanziari.
            </li>
          </ul>
        </section>

        {/* 2. Oggetto del Servizio */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            2. Oggetto del Servizio
          </h2>
          <p>
            Cerbero AI fornisce un&apos;infrastruttura tecnologica di
            automazione (“Autopilot”) che consente all&apos;Utente di collegare
            il proprio portafoglio digitale non-custodial – cioè un wallet di
            cui mantiene il pieno controllo e le chiavi private – a strategie
            algoritmiche di trading.
          </p>
          <p>
            Tali strategie operano su strumenti derivati crypto messi a
            disposizione da piattaforme terze e regolano automaticamente
            l&apos;esecuzione delle operazioni secondo parametri e logiche
            predefinite. Cerbero AI non detiene, gestisce o movimenta fondi per
            conto dell&apos;Utente, limitandosi a fornire il collegamento
            tecnico tra il wallet dell&apos;Utente e le strategie selezionate.
          </p>
          <p>
            La Piattaforma non fornisce, né intende fornire, servizi di
            intermediazione finanziaria, gestione patrimoniale, consulenza o
            raccomandazioni personalizzate.
          </p>
        </section>

        {/* 3. Requisiti di Accesso */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            3. Requisiti di Accesso
          </h2>
          <p>
            Per utilizzare il Servizio, l&apos;Utente dichiara e garantisce di:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>avere almeno 18 anni;</li>
            <li>possedere piena capacità di agire;</li>
            <li>
              non essere soggetto a restrizioni legali che impediscano l&apos;uso
              di strumenti crypto o derivati;
            </li>
            <li>
              utilizzare la Piattaforma esclusivamente nel rispetto delle leggi
              applicabili.
            </li>
          </ul>
        </section>

        {/* 4. Natura del Servizio e Limitazioni */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            4. Natura del Servizio e Limitazioni
          </h2>
          <p>
            Il Servizio opera esclusivamente come infrastruttura non-custodial.
            Il Titolare non:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>detiene asset dell&apos;Utente;</li>
            <li>ha accesso a chiavi private o credenziali;</li>
            <li>può recuperare wallet smarriti;</li>
            <li>può annullare o invertire operazioni eseguite dall&apos;Utente.</li>
          </ul>
          <p>
            Il Titolare non garantisce che il Servizio sia disponibile in modo
            continuo, senza interruzioni o privo di errori tecnici.
          </p>
        </section>

        {/* 5. Rischi Associati */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            5. Rischi Associati
          </h2>
          <p>L&apos;Utente riconosce e accetta che:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              il trading su strumenti derivati crypto è altamente speculativo e
              può comportare perdite totali o superiori al capitale investito;
            </li>
            <li>
              le strategie automatizzate possono generare esiti imprevedibili
              dovuti alla volatilità dei mercati;
            </li>
            <li>
              l&apos;utilizzo di wallet, blockchain e protocolli DeFi comporta
              rischi intrinseci quali vulnerabilità, congestione, blocchi di
              rete, malfunzionamenti o exploit.
            </li>
          </ul>
          <p>
            Il Titolare non garantisce alcun rendimento, risultato o
            conservazione del capitale.
          </p>
        </section>

        {/* 6. Dipendenza da Servizi di Terze Parti */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            6. Dipendenza da Servizi di Terze Parti
          </h2>
          <p>
            La Piattaforma si basa su tecnologie e infrastrutture esterne, quali:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>blockchain e smart contract;</li>
            <li>protocolli DeFi;</li>
            <li>oracoli di prezzo;</li>
            <li>exchange di criptovalute;</li>
            <li>infrastrutture cloud;</li>
            <li>servizi di pagamento o on-ramp.</li>
          </ul>
          <p>
            Eventuali malfunzionamenti, ritardi, exploit, interruzioni o anomalie
            relativi a tali servizi possono influire sul funzionamento della
            Piattaforma.
          </p>
          <p>
            L&apos;Utente prende atto che tali componenti sono interamente esterne
            al controllo del Titolare, il quale declina ogni responsabilità per
            qualsiasi danno, perdita, costo, mancato profitto o conseguenza
            operativa derivante – direttamente o indirettamente – dal
            funzionamento o dal malfunzionamento delle Terze Parti.
          </p>
        </section>

        {/* 7. Esclusione di Consulenza Finanziaria */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            7. Esclusione di Consulenza Finanziaria
          </h2>
          <p>
            Le informazioni fornite attraverso la Piattaforma hanno finalità
            esclusivamente informative e operative.
          </p>
          <p>
            Il Titolare non fornisce:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>consulenza finanziaria;</li>
            <li>consulenza fiscale;</li>
            <li>raccomandazioni personalizzate;</li>
            <li>
              indicazioni idonee a determinare decisioni di investimento.
            </li>
          </ul>
          <p>
            Ogni scelta operativa è assunta in piena autonomia
            dall&apos;Utente.
          </p>
        </section>

        {/* 8. Responsabilità dell’Utente */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            8. Responsabilità dell&apos;Utente
          </h2>
          <p>L&apos;Utente è l&apos;unico responsabile di:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>custodia del proprio wallet e delle chiavi private;</li>
            <li>sicurezza delle credenziali di accesso;</li>
            <li>operazioni autorizzate tramite il proprio wallet;</li>
            <li>
              corretto funzionamento dei dispositivi utilizzati per accedere alla
              Piattaforma.
            </li>
          </ul>
          <p>
            Il Titolare non è responsabile di accessi non autorizzati dovuti a
            negligenza dell&apos;Utente.
          </p>
        </section>

        {/* 9. Limitazione di Responsabilità + Risk Disclosure */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            9. Limitazione di Responsabilità
          </h2>
          <p>
            Nei limiti massimi consentiti dalla legge applicabile, il Titolare
            non potrà essere ritenuto responsabile per:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>perdite economiche di qualsiasi natura, dirette, indirette o consequenziali;</li>
            <li>mancati profitti, perdita di opportunità o danni patrimoniali;</li>
            <li>effetti derivanti da volatilità, dinamiche o condizioni dei mercati crypto;</li>
            <li>
              malfunzionamenti tecnici, bug, exploit, vulnerabilità,
              interruzioni, ritardi o indisponibilità del Servizio;
            </li>
            <li>
              utilizzo improprio della Piattaforma, configurazioni errate o
              trascuratezza dell&apos;Utente.
            </li>
          </ul>
          <p>
            Il Servizio è fornito “as is” e “as available”, ossia nello stato in
            cui si trova e nella misura in cui è disponibile, senza alcuna
            garanzia espressa o implicita.
          </p>
          <p>
            Il Titolare non garantisce che il Servizio sarà:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>continuo, privo di errori o interruzioni;</li>
            <li>immune da vulnerabilità o attacchi;</li>
            <li>idoneo a soddisfare obiettivi specifici dell&apos;Utente;</li>
            <li>
              capace di generare risultati, performance o rendimenti determinati.
            </li>
          </ul>
          <p>
            L&apos;Utente utilizza la Piattaforma sotto la propria esclusiva
            responsabilità, accettando che eventuali rischi operativi o tecnici
            sono inerenti alla natura del Servizio e delle tecnologie
            decentralizzate utilizzate.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            10. Risk Disclosure (Informativa sui Rischi)
          </h2>
          <p>
            L&apos;utilizzo di Cerbero AI e l&apos;esecuzione di strategie
            algoritmiche su strumenti derivati crypto comportano rischi
            significativi. L&apos;Utente riconosce e accetta che:
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            10.1 Rischio di Mercato
          </h3>
          <p>
            I mercati crypto e derivati sono altamente volatili. Movimenti anche
            rapidi e inattesi possono generare perdite rilevanti o totali.
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            10.2 Rischio Operativo
          </h3>
          <p>
            Le strategie automatizzate dipendono da parametri tecnici, algoritmi
            e autorizzazioni fornite dall&apos;Utente. Errori di configurazione,
            parametri inappropriati o interruzioni tecniche possono produrre
            risultati inattesi.
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            10.3 Rischio Tecnologico
          </h3>
          <p>
            L&apos;uso di blockchain, smart contract, protocolli DeFi e
            infrastrutture digitali comporta rischi quali:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>bug o vulnerabilità;</li>
            <li>exploit o attacchi informatici;</li>
            <li>malfunzionamenti di reti o infrastrutture;</li>
            <li>ritardi o mancata esecuzione delle transazioni.</li>
          </ul>

          <h3 className="font-medium text-white/90 mt-2">
            10.4 Rischio di Terze Parti
          </h3>
          <p>
            Il funzionamento della Piattaforma dipende da exchange, oracoli,
            cloud provider e altri servizi esterni su cui il Titolare non
            esercita controllo. La loro indisponibilità o malfunzionamento può
            incidere sulle performance o sull&apos;operatività.
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            10.5 Rischio di Perdita del Wallet
          </h3>
          <p>
            L&apos;Utente è l&apos;unico responsabile della custodia del proprio
            wallet non-custodial, incluse chiavi private e credenziali. La loro
            perdita, compromissione o esposizione può comportare la perdita
            definitiva degli asset.
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            10.6 Rischio Regolamentare
          </h3>
          <p>
            Cambiamenti normativi o restrizioni sull&apos;uso di strumenti crypto
            possono influenzare la disponibilità o l&apos;accesso al Servizio.
          </p>

          <h3 className="font-medium text-white/90 mt-2">
            10.7 Nessuna Garanzia di Risultato
          </h3>
          <p>
            Il Titolare non garantisce:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>profitti o rendimenti;</li>
            <li>accuratezza dei dati;</li>
            <li>continuità dell&apos;operatività;</li>
            <li>conservazione del capitale.</li>
          </ul>
          <p>
            L&apos;Utente dichiara di comprendere tali rischi e di assumersi
            pienamente la responsabilità delle proprie decisioni e dell&apos;uso
            del Servizio.
          </p>
        </section>

        {/* 11. Utilizzo consentito */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            11. Utilizzo Consentito
          </h2>
          <p>
            L&apos;Utente si impegna a utilizzare il Servizio in maniera conforme
            a:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>legge nazionale e internazionale;</li>
            <li>normative antiriciclaggio e antiterrorismo;</li>
            <li>
              divieti relativi a utilizzi fraudolenti, illeciti o in violazione
              di diritti di terzi.
            </li>
          </ul>
        </section>

        {/* 12. Interruzione, Sospensione e Cessazione */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            12. Interruzione, Sospensione e Cessazione del Servizio
          </h2>
          <p>
            Il Titolare può sospendere o terminare l&apos;accesso dell&apos;Utente
            alla Piattaforma in caso di:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>violazioni dei Termini;</li>
            <li>utilizzo illecito o fraudolento;</li>
            <li>
              rischio operativo o di sicurezza per la Piattaforma.
            </li>
          </ul>
          <p>
            La sospensione non dà diritto a indennizzi o risarcimenti.
          </p>
        </section>

        {/* 13. Legge Applicabile */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            13. Legge Applicabile e Controversie
          </h2>
          <p>
            La legge italiana disciplina i presenti Termini. Eventuali
            controversie saranno gestite dai tribunali competenti in conformità
            alla normativa applicabile e ai diritti dell&apos;Utente.
          </p>
        </section>

        {/* 14. High-Risk Investment Warning */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            14. High-Risk Investment Warning (Standard UE/ESMA)
          </h2>
          <p>
            L&apos;Utente è informato che gli strumenti crypto e i derivati
            digitali configurano investimenti ad altissimo rischio secondo le
            linee guida dell&apos;European Securities and Markets Authority
            (ESMA). L&apos;Utente dichiara di comprendere che:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              gli asset crypto sono altamente volatili e possono perdere valore
              rapidamente;
            </li>
            <li>
              le strategie algoritmiche possono amplificare guadagni ma anche
              perdite;
            </li>
            <li>
              non sono garantiti rendimento, protezione del capitale o recupero
              delle somme investite;
            </li>
            <li>
              l&apos;investimento in strumenti complessi può risultare non adatto
              a tutti gli utenti.
            </li>
          </ul>
          <p>
            Il Titolare raccomanda di investire esclusivamente importi che
            l&apos;Utente è disposto a perdere integralmente.
          </p>
        </section>

        {/* 15. User Acknowledgement of Risks */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            15. User Acknowledgement of Risks
          </h2>
          <p>
            Utilizzando la Piattaforma, l&apos;Utente dichiara e accetta
            espressamente quanto segue:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              di aver letto e compreso integralmente il Risk Disclosure,
              l&apos;High-Risk Investment Warning e il presente Disclaimer;
            </li>
            <li>
              di comprendere e accettare i rischi associati all&apos;uso di
              strategie algoritmiche, strumenti derivati crypto e tecnologie
              decentralizzate;
            </li>
            <li>
              di assumersi piena responsabilità per tutte le operazioni
              autorizzate tramite il proprio wallet non-custodial;
            </li>
            <li>
              di non fare affidamento su promesse di profitto, garanzie di
              rendimento o dichiarazioni non presenti nei Termini;
            </li>
            <li>
              di sollevare il Titolare da qualsiasi responsabilità derivante da:
              perdite economiche, volatilità di mercato, errori del wallet o
              configurazioni errate, malfunzionamenti di blockchain, smart
              contract, protocolli DeFi, oracoli o exchange, utilizzo improprio
              del Servizio o negligenza nella protezione delle proprie chiavi
              private.
            </li>
          </ul>
          <p>
            L&apos;Utente conferma che l&apos;uso della Piattaforma avviene in
            piena autonomia e consapevolezza, e che nessuna parte del Servizio
            deve essere interpretata come garanzia o promessa di risultati.
          </p>
        </section>

        {/* 16. Accettazione */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            16. Accettazione
          </h2>
          <p>
            Utilizzando la Piattaforma, l&apos;Utente dichiara di aver letto,
            compreso e accettato integralmente i presenti Termini e Condizioni
            d&apos;Uso, unitamente al Disclaimer Finanziario e alla Privacy
            Policy.
          </p>
        </section>
      </div>
    </main>
  );
}
