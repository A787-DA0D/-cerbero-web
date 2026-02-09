import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type Body = {
  aggressiveness?: "NORMAL" | "AGGRESSIVE";
};

async function getSessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions as any);
  const email = String((session as any)?.user?.email || "").toLowerCase().trim();
  return email || null;
}

export async function GET(_req: NextRequest) {
  try {
    const email = await getSessionEmail();
    if (!email) return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });

    const r = await db.query(
      `SELECT aggressiveness FROM tenants WHERE lower(email)=lower($1) LIMIT 1;`,
      [email]
    );
    if (!r.rowCount) return NextResponse.json({ ok: false, error: "TENANT_NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ ok: true, aggressiveness: (r.rows[0]?.aggressiveness ?? "NORMAL") }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR", message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const email = await getSessionEmail();
    if (!email) return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Body | null;
    const ag = String(body?.aggressiveness || "").toUpperCase().trim();

    if (ag !== "NORMAL" && ag !== "AGGRESSIVE") {
      return NextResponse.json({ ok: false, error: "BAD_AGGRESSIVENESS" }, { status: 400 });
    }

    const r = await db.query(
      `
      UPDATE tenants
      SET aggressiveness = $1, updated_at = now()
      WHERE lower(email)=lower($2)
      RETURNING email, aggressiveness;
      `,
      [ag, email]
    );

    if (!r.rowCount) return NextResponse.json({ ok: false, error: "TENANT_NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ ok: true, email, aggressiveness: r.rows[0]?.aggressiveness ?? ag }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR", message: String(e?.message ?? e) }, { status: 500 });
  }
}
