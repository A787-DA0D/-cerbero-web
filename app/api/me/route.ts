import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
  try {
    if (!JWT_SECRET) {
      console.error("[/api/me] JWT_SECRET non impostato");
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (JWT_SECRET missing)" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json(
        { ok: false, error: "Missing bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.slice("bearer ".length).trim();
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Empty token" },
        { status: 401 }
      );
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;

    const email = payload.email ?? null;
    const wallet = payload.wallet ?? null;
    const sub = payload.sub ?? null;

    return NextResponse.json(
      {
        ok: true,
        email,
        wallet,
        sub,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/me] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
