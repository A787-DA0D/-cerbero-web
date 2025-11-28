// lib/db.ts
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Evita di creare più pool in sviluppo (Next ricarica i moduli)
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

export const db: Pool =
  global.pgPool ??
  new Pool({
    connectionString,
    // opzionale: ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = db;
}
