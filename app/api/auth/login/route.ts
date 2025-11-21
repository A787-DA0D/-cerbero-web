import { NextRequest, NextResponse } from "next/server";
import { Magic } from "@magic-sdk/admin";
import jwt from "jsonwebtoken";

// Istanza admin di Magic (usa la chiave segreta)
const magic = new Magic(process.env.MAGIC_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    // 1. Leggiamo il DID token dall'header Authorization: Bearer <token>
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json(
        { ok: false, error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const didToken = authHeader.slice("bearer ".length).trim();
    if (!didToken) {
      return NextResponse.json(
        { ok: false, error: "Missing DID token" },
        { status: 401 }
      );
    }

    // 2. Validiamo il token con Magic
    await magic.token.validate(didToken);

    // 3. Recuperiamo i metadata dell'utente (email + wallet)
    const userMetadata = await magic.users.getMetadataByToken(didToken);

    if (!userMetadata || !userMetadata.publicAddress) {
      return NextResponse.json(
        { ok: false, error: "User metadata not found" },
        { status: 401 }
      );
    }

    const email = userMetadata.email ?? "";
    const wallet = userMetadata.publicAddress;

    // 4. Creiamo il JWT di sessione (14 giorni)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET non impostato nelle env");
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (JWT_SECRET missing)" },
        { status: 500 }
      );
    }

    const sessionToken = jwt.sign(
      {
        sub: userMetadata.issuer,
        email,
        wallet,
      },
      secret,
      { expiresIn: "14d" }
    );

    // 5. Risposta OK al frontend
    return NextResponse.json(
      {
        ok: true,
        sessionToken,
        user: {
          email,
          wallet,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Magic Login Error:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Auth failed",
      },
      { status: 401 }
    );
  }
}
