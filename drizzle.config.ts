import { defineConfig } from "drizzle-kit";

import { env } from "./src/env.mjs";

if (!env.DB_URI) throw new Error("DB_URI is required");
if (env.DB_URI.startsWith("libsql://") && !env.TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_AUTH_TOKEN is required");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./.drizzle",
  dialect: "turso",
  dbCredentials: {
    url: env.DB_URI,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  strict: env.NODE_ENV === "production",
  verbose: env.NODE_ENV !== "production",
  casing: "snake_case",
});

