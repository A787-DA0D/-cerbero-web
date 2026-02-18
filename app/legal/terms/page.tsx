"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-10 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Terms and Conditions – Cerbero AI
          </h1>
          <p className="text-sm text-white/70">
            2026-02-18
          </p>
        </header>

        {/* 1. Definitions */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            1. Definitions
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>“Platform” or “Service”</strong> refers to Cerbero AI,
              accessible via cerberoai.com and related interfaces.
            </li>
            <li>
              <strong>“Company”</strong> refers to the operator and provider of Cerbero AI.
            </li>
            <li>
              <strong>“User”</strong> refers to any individual or legal entity
              accessing or using the Platform.
            </li>
            <li>
              <strong>“Autopilot”</strong> refers to the automated AI-based
              execution infrastructure that connects a User’s MT5 trading
              account via MetaApi.
            </li>
            <li>
              <strong>“Broker”</strong> refers to the third-party financial
              intermediary where the User holds their trading account.
            </li>
          </ul>
        </section>

        {/* 2. Nature of the Service */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            2. Nature of the Service
          </h2>
          <p>
            Cerbero AI provides an automated AI-driven trading infrastructure
            that connects to a User’s MetaTrader 5 (MT5) account through MetaApi.
          </p>
          <p>
            The Platform executes algorithmic strategies on the User’s broker
            account according to predefined system logic.
          </p>
          <p>
            Cerbero AI does not operate as a broker, financial intermediary,
            asset manager, or investment advisor.
          </p>
        </section>

        {/* 3. No Custody of Funds */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            3. No Custody of Funds
          </h2>
          <p>
            Cerbero AI never holds, manages, or takes custody of User funds.
          </p>
          <p>
            All capital remains deposited with the User’s chosen broker.
            Cerbero AI has no access to withdrawals and cannot move funds
            outside the connected trading account.
          </p>
        </section>

        {/* 4. No Investment Advice */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            4. No Investment Advice
          </h2>
          <p>
            The Service does not constitute investment advice, portfolio
            management, financial consultancy, or personalized
            recommendations.
          </p>
          <p>
            All trading decisions remain the sole responsibility of the User.
          </p>
        </section>

        {/* 5. Trading Risk Disclosure */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            5. Trading Risk Disclosure
          </h2>
          <p>
            Trading financial instruments such as Forex, CFDs, indices,
            commodities, or derivatives involves significant risk.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Markets may be highly volatile.</li>
            <li>Leverage can amplify both gains and losses.</li>
            <li>Total loss of capital is possible.</li>
            <li>Past performance does not guarantee future results.</li>
          </ul>
          <p>
            Users should only trade with capital they can afford to lose.
          </p>
        </section>

        {/* 6. Dependence on Third Parties */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            6. Dependence on Third-Party Infrastructure
          </h2>
          <p>
            The Platform relies on third-party services including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>MetaApi infrastructure;</li>
            <li>User-selected brokers;</li>
            <li>Cloud service providers;</li>
            <li>Market data providers.</li>
          </ul>
          <p>
            Cerbero AI is not responsible for outages, slippage, execution
            delays, broker failures, pricing discrepancies, or infrastructure
            interruptions.
          </p>
        </section>

        {/* 7. User Responsibilities */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            7. User Responsibilities
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maintaining secure broker credentials;</li>
            <li>Ensuring proper broker account configuration;</li>
            <li>Understanding leverage and margin requirements;</li>
            <li>Complying with applicable financial regulations;</li>
            <li>Monitoring account performance and risk exposure.</li>
          </ul>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            8. Limitation of Liability
          </h2>
          <p>
            The Service is provided “as is” and “as available.”
          </p>
          <p>
            To the maximum extent permitted by law, Cerbero AI shall not be
            liable for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Trading losses of any kind;</li>
            <li>Loss of profits or opportunity;</li>
            <li>Broker-side execution errors;</li>
            <li>Technical interruptions or system downtime;</li>
            <li>Market volatility or slippage.</li>
          </ul>
        </section>

        {/* 9. Suspension & Termination */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            9. Suspension and Termination
          </h2>
          <p>
            Cerbero AI reserves the right to suspend or terminate access to the
            Platform in cases of:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Violation of these Terms;</li>
            <li>Fraudulent or abusive use;</li>
            <li>Operational or security risks.</li>
          </ul>
        </section>

        {/* 10. Governing Law */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            10. Governing Law
          </h2>
          <p>
            These Terms shall be governed by applicable law in the jurisdiction
            of the Company.
          </p>
        </section>

        {/* 11. User Acknowledgment */}
        <section className="space-y-2 text-sm leading-relaxed text-white/80">
          <h2 className="text-base md:text-lg font-semibold text-white">
            11. User Acknowledgment
          </h2>
          <p>
            By using Cerbero AI, the User confirms that they:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Understand the risks of leveraged trading;</li>
            <li>Accept full responsibility for their trading decisions;</li>
            <li>Acknowledge that no profits are guaranteed;</li>
            <li>Use the Platform at their own risk.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
