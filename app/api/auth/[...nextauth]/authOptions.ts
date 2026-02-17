// app/api/auth/[...nextauth]/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Pool } from "pg";
import PgAdapter from "@auth/pg-adapter";
import { Resend } from "resend";

export const runtime = "nodejs";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function isTenantEmail(email: string) {
  const q = "select 1 from tenants where lower(email)=lower($1) limit 1";
  const r = await pool.query(q, [email]);
  return (r.rowCount ?? 0) > 0;
}

const resend = new Resend(process.env.RESEND_API_KEY);

function cerberoLoginEmailHtml(params: { url: string; email: string; supportEmail: string }) {
  const { url, email, supportEmail } = params;

  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Accedi a Cerbero AI</title>
  </head>
  <body style="margin:0;padding:0;background:#050816;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
      <div style="border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));">
        <div style="padding:22px 22px 16px;background:
          radial-gradient(1000px 260px at 20% 0%, rgba(34,211,238,0.22), transparent 60%),
          radial-gradient(900px 260px at 80% 0%, rgba(236,72,153,0.20), transparent 55%),
          radial-gradient(900px 260px at 60% 0%, rgba(168,85,247,0.18), transparent 58%);">
          <div style="font-size:12px;letter-spacing:.22em;font-weight:800;color:rgba(255,255,255,0.70);text-transform:uppercase;">Cerbero AI</div>
          <div style="margin-top:10px;font-size:26px;font-weight:900;color:#fff;line-height:1.15;">Accedi alla tua dashboard</div>
          <div style="margin-top:8px;font-size:14px;color:rgba(255,255,255,0.72);">
            Stai effettuando l’accesso con <b style="color:#fff;">${email}</b>.
          </div>
        </div>

        <div style="padding:18px 22px 24px;">
          <div style="font-size:14px;color:rgba(255,255,255,0.78);line-height:1.6;">
            Clicca sul pulsante per completare l’accesso. Il link è valido per un tempo limitato.
          </div>

          <div style="margin-top:18px;">
            <a href="${url}"
              style="display:inline-block;text-decoration:none;padding:12px 16px;border-radius:12px;
              font-weight:800;font-size:14px;color:#08101a;
              background:linear-gradient(135deg,#22d3ee,#a855f7,#ec4899);">
              Vai alla Dashboard
            </a>
          </div>

          <div style="margin-top:14px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.5;">
            Se il pulsante non funziona, copia e incolla questo link nel browser:<br/>
            <span style="word-break:break-all;color:rgba(255,255,255,0.75);">${url}</span>
          </div>

          <div style="margin-top:18px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);
            background:rgba(255,255,255,0.04);font-size:12px;color:rgba(255,255,255,0.68);">
            Se non hai richiesto tu questo accesso, puoi ignorare questa email.
          </div>

          <div style="margin-top:18px;font-size:12px;color:rgba(255,255,255,0.60);">
            Hai bisogno di aiuto? Scrivi a <a href="mailto:${supportEmail}" style="color:#22d3ee;text-decoration:none;">${supportEmail}</a>
          </div>

          <div style="margin-top:16px;font-size:12px;color:rgba(255,255,255,0.42);">
            — Team Cerbero AI
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export const authOptions: NextAuthOptions = {
  adapter: PgAdapter(pool),

  providers: [
    EmailProvider({
      // manteniamo SMTP config (anche se inviamo via Resend)
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,

      async sendVerificationRequest({ identifier, url, provider }) {
        const supportEmail = (process.env.SUPPORT_EMAIL || "support@cerberoai.com").toString();
        const from = (process.env.RESEND_FROM || process.env.EMAIL_FROM || provider.from || "noreply@cerberoai.com").toString();

        const subject = "Accedi a Cerbero AI";
        const html = cerberoLoginEmailHtml({ url, email: identifier, supportEmail });
        const text = `Accedi a Cerbero AI\n\nLink: ${url}\n\nSe non hai richiesto tu questo accesso, ignora questa email.\nSupporto: ${supportEmail}`;

        if (!process.env.RESEND_API_KEY) {
          // fallback su provider.sendVerificationRequest default: se non c'è RESEND_API_KEY, usa SMTP provider
          // @ts-ignore
          return await provider.sendVerificationRequest?.({ identifier, url, provider });
        }

        await resend.emails.send({
          from,
          to: identifier,
          subject,
          html,
          text,
        });
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    verifyRequest: "/login?check=1",
    error: "/login?error=1",
  },

  callbacks: {
    // Nota: questo callback NON blocca l'invio email (quello avviene prima).
    // Lo teniamo come safety-net: se non è tenant, non deve entrare.
    async signIn({ user, account }) {
      if (account?.provider !== "email") return true;
      const email = (user?.email || "").trim().toLowerCase();
      if (!email) return false;

      const ok = await isTenantEmail(email);
      if (!ok) return false; // non entra
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
};
