import { NextResponse } from "next/server";
import { Firestore } from "@google-cloud/firestore";
import { google } from "googleapis";

const FIRESTORE_PROJECT_ID = process.env.GCP_PROJECT_ID;
const FIRESTORE_CLIENT_EMAIL = process.env.GCP_CLIENT_EMAIL;
const FIRESTORE_PRIVATE_KEY = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n");

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

let firestore: Firestore | null = null;

if (FIRESTORE_PROJECT_ID && FIRESTORE_CLIENT_EMAIL && FIRESTORE_PRIVATE_KEY) {
  firestore = new Firestore({
    projectId: FIRESTORE_PROJECT_ID,
    credentials: {
      client_email: FIRESTORE_CLIENT_EMAIL,
      private_key: FIRESTORE_PRIVATE_KEY,
    },
  });
} else {
  console.warn(
    "[early-access] Firestore NON configurato. Configura GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY per abilitare il salvataggio."
  );
}

async function sendWelcomeEmail(email: string) {
  if (
    !GMAIL_USER ||
    !GMAIL_CLIENT_ID ||
    !GMAIL_CLIENT_SECRET ||
    !GMAIL_REFRESH_TOKEN
  ) {
    console.warn(
      "[early-access] Gmail API NON configurata. Configura GMAIL_* per abilitare l'email di benvenuto."
    );
    return;
  }

  const oAuth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oAuth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const subject = "Benvenuto nella lista d’attesa di Cerbero AI";
  const body = `
Ciao,

sei ufficialmente nella lista d’attesa per Cerbero AI.

Stiamo costruendo una piattaforma di autotrading assistita dall'AI,
pensata per farti gestire il capitale in modo semplice, chiaro e sempre sotto il tuo controllo.

Nei prossimi aggiornamenti riceverai:
- novità sul lancio,
- dettagli sull’accesso anticipato,
- materiali dedicati su come funzionerà Cerbero.

Switch On. Sit Back. Relax.

Cerbero AI
`;

  const messageParts = [
    `From: Cerbero AI <${GMAIL_USER}>`,
    `To: <${email}>`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ];

  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email non valida." },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();

    // 1) Salvataggio su Firestore (se configurato)
    if (firestore) {
      const col = firestore.collection("early_access");
      await col.add({
        email: normalized,
        createdAt: new Date().toISOString(),
        source: "coming-soon",
      });
    }

    // 2) Email di benvenuto (se Gmail API è configurata)
    try {
      await sendWelcomeEmail(normalized);
    } catch (err) {
      console.warn("[early-access] Errore nell'invio email:", err);
      // Non blocchiamo l'utente se l'email fallisce
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[early-access] Errore generale:", err);
    return NextResponse.json(
      { error: "Errore interno. Riprova più tardi." },
      { status: 500 }
    );
  }
}
