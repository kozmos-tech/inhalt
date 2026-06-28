// better-auth server instance - user accounts and dashboard sessions.
//
// This is the human-facing half of auth (email + password, cookie sessions),
// distinct from the machine-facing bearer keys in lib/auth/bearer.ts that gate the
// MCP server. Sessions are stored in Postgres via the Prisma adapter; the
// nextCookies() plugin lets server actions set the session cookie.
//
// Each new user gets their own workspace: the create.after hook below provisions
// a Project owned by that user, so signup yields a ready-to-use content space in
// one step. getProject() (lib/project.ts) then resolves the caller's project from
// their session.

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { mcp } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"

import { prisma } from "@/lib/prisma"

// The MCP server lives at <origin>/mcp; this is the OAuth "resource" clients
// authorize against. Derived from the app origin so dev and prod stay in sync.
const mcpResource = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/mcp`

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
  // mcp() turns better-auth into an OAuth 2.0 server for MCP clients: discovery,
  // dynamic client registration, authorize/token, PKCE. Unauthenticated authorize
  // requests bounce to loginPage, which resumes the flow after sign-in.
  // nextCookies() must stay last so it can attach Set-Cookie headers.
  plugins: [mcp({ loginPage: "/login", resource: mcpResource }), nextCookies()],
})
