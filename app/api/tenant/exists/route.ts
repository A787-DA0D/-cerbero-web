import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: true, exists: false });
    }

    const q = `
      SELECT 1
      FROM tenants
      WHERE lower(email) = lower($1)
      LIMIT 1
    `;
    const r = await pool.query(q, [email]);

    return NextResponse.json({
      ok: true,
      exists: r.rowCount > 0,
    });
  } catch (err) {
    console.error("tenant exists error", err);
    return NextResponse.json(
      { ok: false, exists: false },
      { status: 500 }
    );
  }
}
