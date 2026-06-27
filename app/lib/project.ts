// Resolving the current project.
//
// Authentication is deferred (it arrives later via better-auth / API-key auth),
// but every management handler still needs a Project to scope to. For now this
// resolves the single default project (self-host single-project mode). This is
// the ONLY place tenancy is decided, so swapping in session / API-key resolution
// later is a one-file change.

import { prisma } from "./prisma"
import { ApiError } from "./api"

export async function getProject() {
  const project = await prisma.project.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (!project) {
    throw new ApiError(
      503,
      "no_project",
      "No project exists yet. Run `npm run db:seed` to create the default project.",
    )
  }

  return project
}
