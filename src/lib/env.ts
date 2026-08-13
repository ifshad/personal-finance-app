import { z } from "zod";

/**
 * Centralized, validated environment configuration.
 *
 * Every module that needs an environment variable should import from here
 * instead of reading `process.env` directly. This keeps configuration
 * validation in one place and fails fast with a clear error at startup
 * instead of a confusing runtime failure deep in a service.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  // Single stateless auth token lifetime (e.g. 15m, 7d). See src/server/auth.
  JWT_EXPIRES_IN: z.string().default("7d"),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration. Check your .env.local file:\n${issues}`,
    );
  }

  return parsed.data;
}

let cachedEnv: Env | undefined;

/**
 * Validated lazily (on first property access) rather than at import time.
 * ES module imports are hoisted above other top-level statements, so a
 * consumer like knexfile.ts that loads `.env.local` via dotenv and then
 * imports this module needs that dotenv call to run before validation —
 * which only happens if validation is deferred past module-load time.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: keyof Env) {
    cachedEnv ??= loadEnv();
    return cachedEnv[prop];
  },
});
