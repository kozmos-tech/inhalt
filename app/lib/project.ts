// Resolving the current project for the management REST routes.
//
// Tenancy is decided in exactly one place: the caller's better-auth session
// identifies a User, and we return the Project they own. This is the only spot
// the management surface (content-types, keys) maps a request to a tenant, so
// the auth model lives here and the handlers stay identity-agnostic.
//
// Note: the public read API (app/api/read/[projectSlug]/...) does NOT use this —
// it resolves a project by the slug in its path and stays unauthenticated. The
// MCP surface resolves its own tenant from the bearer key (lib/bearer-auth.ts).

import { prisma } from "./prisma"
import { ApiError } from "./api"
import { requireSession } from "./session"

export async function getProject() {
  const session = await requireSession()

  const project = await prisma.project.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  if (!project) {
    throw new ApiError(
      503,
      "no_project",
      "Your account has no workspace yet. Sign out and sign up again to create one.",
    )
  }

  return project
}
