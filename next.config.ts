import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Knex tries to `require()` every dialect driver it supports (pg,
  // sqlite3, tedious, ...) even though we only use mysql2. Bundling it
  // would make the build fail trying to resolve those unused drivers, so
  // it's kept external and resolved by Node at runtime instead.
  serverExternalPackages: ["knex", "mysql2"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevents the browser from guessing content types (mitigates
          // some content-sniffing based attacks).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Blocks the app from being embedded in a foreign <iframe>
          // (clickjacking protection); no legitimate reason to embed it.
          { key: "X-Frame-Options", value: "DENY" },
          // Don't leak the full URL (which can contain ids) to third-party
          // link targets.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
