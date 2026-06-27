import { defineConfig, env } from "prisma/config"

// Prisma 7 no longer reads the datasource URL from schema.prisma, and the
// config loader does not auto-load .env. Load it here so CLI commands
// (migrate, db push, studio) can reach the database. Node provides loadEnvFile.
try {
  process.loadEnvFile()
} catch {
  // No .env present (e.g. CI with real env vars already set). Ignore.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    // Run via `prisma db seed` (or `npm run db:seed`). tsx is used so the
    // generated Prisma client (TS, with extensionless imports) resolves.
    seed: "tsx prisma/seed.ts",
  },
})
