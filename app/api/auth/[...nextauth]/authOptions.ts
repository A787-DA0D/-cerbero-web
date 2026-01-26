// app/api/auth/[...nextauth]/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Pool } from "pg";
import PgAdapter from "@auth/pg-adapter";

export const runtime = "nodejs";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function isTenantEmail(email: string) {
  const q = "select 1 from tenants where lower(email)=lower($1) limit 1";
  const r = await pool.query(q, [email]);
  return (r.rowCount ?? 0) > 0;
}

export const authOptions: NextAuthOptions = {
  adapter: PgAdapter(pool),

  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
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
