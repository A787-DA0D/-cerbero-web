// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Mittente delle email (puoi cambiarlo quando vuoi)
const FROM_EMAIL =
  process.env.EMAIL_FROM || "Cerbero AI <noreply@cerberoai.com>";

/**
 * Invia la Welcome Email dopo la registrazione/pagamento.
 *
 * Params:
 * - to: email del cliente
 * - name: nome del cliente (opzionale)
 * - walletAddress: indirizzo del wallet Magic
 * - accountUrl: link alla pagina /account del cliente
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  walletAddress?: string | null;
  accountUrl: string;
}) {
  // Destrutturo i parametri
  const { to, name, walletAddress, accountUrl } = params;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Benvenuto in Cerbero AI – Il tuo conto è pronto",
      html: `
  <!DOCTYPE html>
  <html lang="it">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Benvenuto in Cerbero AI</title>
    </head>

    <body style="margin:0; padding:24px; background:#020617; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif; color:#e5e7eb;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; background:#020617; border-radius:24px; border:1px solid rgba(148,163,184,0.25); box-shadow:0 30px 80px rgba(15,23,42,0.95); overflow:hidden;">
              
              <!-- BARRA COLORATA -->
              <tr>
                <td style="height:4px; background:linear-gradient(90deg,#22d3ee,#38bdf8,#6366f1);"></td>
              </tr>

              <!-- CONTENUTO -->
              <tr>
                <td style="padding:32px 28px 40px 28px;">

                  <h1 style="margin:0; font-size:26px; font-weight:600; color:white;">
                    Benvenuto in <span style="color:#38bdf8;">Cerbero AI</span>
                  </h1>

                  <p style="margin-top:16px; font-size:15px; color:#cbd5e1; line-height:1.6;">
                    Ciao <strong>${name}</strong>, il tuo conto è stato attivato con successo.
                    Da questo momento, la tua <strong>Coscienza Finanziaria</strong> è pronta
                    a lavorare 24/7 per far crescere il tuo capitale.
                  </p>

                  ${
                    walletAddress
                      ? `
                  <p style="margin-top:18px; font-size:14px; color:#94a3b8;">
                    <strong>Wallet personale:</strong><br/>
                    <span style="font-family:monospace; color:white;">
                      ${walletAddress}
                    </span>
                  </p>
                  `
                      : ""
                  }

                  <p style="margin-top:24px; font-size:15px; line-height:1.7;">
                    Per motivi di sicurezza, ti chiediamo di:
                  </p>

                  <ul style="color:#94a3b8; margin-top:10px; padding-left:18px; line-height:1.7; font-size:14px;">
                    <li>Accedere alla tua area personale</li>
                    <li>Esportare la tua <strong>chiave privata Magic</strong></li>
                    <li>Conservarla in un posto sicuro</li>
                  </ul>

                  <!-- BOTTONE -->
                  <div style="margin-top:32px; text-align:center;">
                    <a href="${accountUrl}"
                      style="background:#38bdf8; color:#0f172a; padding:14px 22px; border-radius:14px; font-size:15px; font-weight:600; text-decoration:none; display:inline-block;">
                      Vai al tuo Account
                    </a>
                  </div>

                  <p style="margin-top:32px; font-size:13px; color:#64748b;">
                    Per qualsiasi necessità puoi contattarci a:<br/>
                    <strong>support@cerberoai.com</strong>
                  </p>

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
  </html>
      `,
    });

    return { ok: true };
  } catch (error) {
    console.error("Errore invio welcome email:", error);
    return { ok: false };
  }
}
