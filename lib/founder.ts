export function isFounder(email: string | null | undefined) {
  const e = (email || "").toLowerCase().trim();
  if (!e) return false;

  const raw = (process.env.FOUNDER_EMAILS || "").toLowerCase();
  const set = new Set(raw.split(",").map(s => s.trim()).filter(Boolean));

  return set.has(e);
}
