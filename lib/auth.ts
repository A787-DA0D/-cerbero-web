export async function getSession(req: Request): Promise<{ email: string } | null> {
  // ✅ Minimal: prende l'email dal body o header.
  // NB: è solo per sbloccare deploy e wiring; dopo lo colleghiamo a Magic session vera.
  const email =
    req.headers.get("x-cerbero-email") ||
    req.headers.get("x-user-email") ||
    "";
  if (!email) return null;
  return { email };
}
