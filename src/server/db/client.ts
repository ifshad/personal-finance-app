import knexFactory, { type Knex } from "knex";
import knexConfig from "../../../knexfile";

/**
 * Single shared Knex instance for the whole app.
 *
 * Next.js can reload modules in development (hot reload), which would
 * otherwise create a new connection pool on every edit. We cache the
 * instance on `globalThis` in development so it survives module reloads.
 */
declare global {
  var __knex__: Knex | undefined;
}

function createKnexInstance(): Knex {
  return knexFactory(knexConfig);
}

export const db: Knex =
  process.env.NODE_ENV === "production"
    ? createKnexInstance()
    : (globalThis.__knex__ ??= createKnexInstance());
