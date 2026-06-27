// Seed the default project.
//
// Auth is deferred, so the management API scopes to a single default project
// (see app/lib/project.ts). This creates that project plus one sample content
// type so the API works the moment the tables exist. Safe to run repeatedly:
// every write is an upsert. Run with `npm run db:seed` (writes to your DB).

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../app/generated/prisma/client"

// The Prisma config loader does not populate process.env for this child
// process, so load .env here. Node provides loadEnvFile (no-op friendly).
try {
  process.loadEnvFile()
} catch {
  // No .env file; assume DATABASE_URL is already in the environment.
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Sample content type. Mirrors the field-definition shape in ARCHITECTURE.md and
// is validated by fieldsSchema on the way in when created through the API; here
// it is trusted seed data.
const postFields = [
  { key: "title", type: "string", required: true, maxLength: 120 },
  { key: "body", type: "richtext", required: true },
  { key: "kind", type: "enum", options: ["news", "guide"] },
  { key: "tags", type: "list", of: "string" },
]

async function main() {
  const project = await prisma.project.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "Default", slug: "default" },
  })

  await prisma.contentType.upsert({
    where: { projectId_key: { projectId: project.id, key: "post" } },
    update: {},
    create: {
      projectId: project.id,
      key: "post",
      name: "Blog Post",
      fields: postFields,
    },
  })

  console.log(`Seeded project "${project.slug}" with content type "post".`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
