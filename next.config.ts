import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Knex tries to `require()` every dialect driver it supports (pg,
  // sqlite3, tedious, ...) even though we only use mysql2. Bundling it
  // would make the build fail trying to resolve those unused drivers, so
  // it's kept external and resolved by Node at runtime instead.
  serverExternalPackages: ["knex", "mysql2"],
};

export default nextConfig;
