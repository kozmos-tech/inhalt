// better-auth server instance — user accounts and dashboard sessions.
//
// This is the human-facing half of auth (email + password, cookie sessions),
// distinct from the machine-facing bearer keys in bearer-auth.ts that gate the
// MCP server. Sessions are stored in Postgres via the Prisma adapter; the
// nextCookies() plugin lets server actions set the session cookie.
//
// Each new user gets their own workspace: the create.after hook below provisions
// a Project owned by that user, so signup yields a ready-to-use content space in
// one step. getProject() (lib/project.ts) then resolves the caller's project from
// their session.

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"

import { prisma } from "./prisma"

// Turn an email into a readable, URL-safe project slug, with a short random
// suffix so two "jane@..." signups can't collide on Project.slug (it is @unique
// and used in the public read-API path).
function projectSlug(email: string): string {
  const base =
    email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "workspace"
  const suffix = Math.random().toString(16).slice(2, 8)
  return `${base}-${suffix}`
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.project.create({
            data: {
              name: `${user.name || user.email.split("@")[0]}'s workspace`,
              slug: projectSlug(user.email),
              ownerId: user.id,
            },
          })
        },
      },
    },
  },
  // nextCookies() must be the last plugin so it can attach Set-Cookie headers.
  plugins: [nextCookies()],
})
