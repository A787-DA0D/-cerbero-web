// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "Cerbero AI <onboarding@resend.dev>";

/**
 * Invia la Welcome Email dopo la registrazione + pagamento Stripe.
 * userEmail = email del cliente (serve per spedire la mail)
 * walletAddress = indirizzo Arbitrum (lo mostriamo nella mail)
 */
export async function sendWelcomeEmail(userEmail: string, walletAddress: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Benvenuto su Cerbero AI – Il tuo conto è pronto",
      html: `
        <div style="font-family:Arial, sans-serif;padding:20px;font-size:15px;line-height:1.6;color:#ffffff;background:#0a0a0a">
          <h2 style="color:#7df9ff">Benvenuto in Cerbero AI</h2>

          <p>Ciao,</p>
          <p>Il tuo account Cerbero è stato creato con successo e il tuo wallet Arbitrum One è attivo.</p>

          <h3 style="color:#7df9ff;margin-top:25px">🔐 Il tuo wallet</h3>
          <p><strong>Indirizzo:</strong> ${walletAddress}</p>

          <p>Per motivi di sicurezza, la <strong>chiave privata</strong> non viene mai inviata via email.  
          Puoi recuperarla nella tua area personale:</p>

          <p style="margin:20px 0">
            <a href="https://cerberoai.com/account" 
               style="background:#7df9ff;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
              Vai al tuo Account
            </a>
          </p>

          <p>All'interno troverai il pulsante:</p>
          <p><strong>“Esporta la tua chiave privata (Magic Link)”</strong></p>

          <hr style="border:0;border-top:1px solid #333;margin:30px 0">

          <p>Se hai bisogno, il team Cerbero è sempre a disposizione.</p>
          <p style="margin-top:25px;color:#888;font-size:12px">
            © 2025 Cerbero AI – Autonomous Capital Engine
          </p>
        </div>
      `,
    });

    return { ok: true };
  } catch (err) {
    console.error("Errore invio welcome email:", err);
    return { ok: false };
  }
}
