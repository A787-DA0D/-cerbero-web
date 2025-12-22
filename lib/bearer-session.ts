import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export type BearerSession = {
  email: string;
  wallet?: string | null;
  sub?: string | null;
};

export function getBearerSession(req: NextRequest): BearerSession | null {
  if (!JWT_SECRET) return null;

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;

  const token = authHeader.slice("bearer ".length).trim();
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const email = (payload?.email || "").toString().toLowerCase().trim();
    if (!email) return null;

    return {
      email,
      wallet: payload?.wallet ?? null,
      sub: payload?.sub ?? null,
    };
  } catch {
    return null;
  }
}
