import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import DashboardClient from "./DashboardClient";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

async function isTenant(email: string): Promise<boolean> {
  const res = await db.query(
    `SELECT 1 FROM tenants WHERE email = $1 LIMIT 1;`,
    [email.toLowerCase().trim()]
  );
  return (res.rowCount || 0) > 0;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const email = (session?.user?.email || "").toString().toLowerCase().trim();
  if (!email) redirect("/login");

  const ok = await isTenant(email);
  if (!ok) redirect(`/signup?email=${encodeURIComponent(email)}`);

  // Passiamo l'email al client (comodo per header/UI)
  return <DashboardClient />;
}
