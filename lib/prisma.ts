// Prisma client singleton.
//
// Prisma 7 connects through a driver adapter rather than a bundled engine, so we
// build a Postgres adapter from DATABASE_URL and pass it to the client. The
// instance is cached on globalThis in development so hot reloads do not open a
// new connection pool on every change.

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/app/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
