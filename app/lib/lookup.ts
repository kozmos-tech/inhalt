// Shared lookups that 404 cleanly when a record is missing, so the route
// handlers can fetch a content type or entry in one line and let `handle()`
// turn the ApiError into a 404 response.

import { prisma } from "./prisma"
import { ApiError } from "./api"

export async function requireContentType(projectId: string, key: string) {
  const type = await prisma.contentType.findUnique({
    where: { projectId_key: { projectId, key } },
  })
  if (!type) throw new ApiError(404, "not_found", `Content type "${key}" not found.`)
  return type
}

export async function requireEntry(contentTypeId: string, slug: string) {
  const entry = await prisma.entry.findUnique({
    where: { contentTypeId_slug: { contentTypeId, slug } },
  })
  if (!entry) throw new ApiError(404, "not_found", `Entry "${slug}" not found.`)
  return entry
}
