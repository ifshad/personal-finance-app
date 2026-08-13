// Knex CLI entry point (migrations, seeds). Run via the `db:*` npm scripts,
// which execute this through `tsx` so it can be plain TypeScript.
//
// Next.js loads `.env.local` automatically for the app itself, but the Knex
// CLI runs outside Next.js, so we load it explicitly here first.
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local" });
loadDotenv(); // fall back to .env if present

import type { Knex } from "knex";
import type { Field as MysqlField } from "mysql2";
import { env } from "./src/lib/env";

// Knex's bundled type defs only know mysql2's `dateStrings` as a boolean,
// but mysql2 also accepts an array of type names (e.g. ["DATE"]) to opt in
// per-type. Building the object as a plain record and casting once at the
// boundary avoids lying about the shape of every other field.
const connection: Record<string, unknown> = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  // A DATE column (transaction_date, budgets.period_start/end) has no time
  // or timezone component. Returning it as a JS Date would force one in via
  // the server's local timezone, which can silently shift the calendar
  // date. Keep it as the plain "YYYY-MM-DD" string MySQL stores.
  dateStrings: ["DATE"],
  typeCast: (field: MysqlField, next: () => unknown) => {
    // MySQL has no native boolean type; we store booleans as TINYINT(1).
    // Cast them back to real booleans instead of leaving them as 0/1.
    if (field.type === "TINY" && field.length === 1) {
      const value = field.string();
      return value === null ? null : value === "1";
    }
    return next();
  },
};

const config: Knex.Config = {
  client: "mysql2",
  connection: connection as Knex.Config["connection"],
  migrations: {
    directory: "./db/migrations",
    extension: "ts",
    tableName: "knex_migrations",
  },
  seeds: {
    directory: "./db/seeds",
    extension: "ts",
  },
  pool: { min: 0, max: 10 },
};

export default config;
