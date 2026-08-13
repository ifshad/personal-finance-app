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

const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    typeCast: (field: MysqlField, next: () => unknown) => {
      // MySQL has no native boolean type; we store booleans as TINYINT(1).
      // Cast them back to real booleans instead of leaving them as 0/1.
      if (field.type === "TINY" && field.length === 1) {
        const value = field.string();
        return value === null ? null : value === "1";
      }
      return next();
    },
  },
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
