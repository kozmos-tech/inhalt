// Read API — one published entry (public).
//   GET /api/read/:projectSlug/:typeKey/:slug
//
// Returns the published copy only. A draft-only entry (never published) is a 404
// here, exactly as it would be to any external reader.

import { prisma } from "../../../../../lib/prisma"
import { handle, json, ApiError } from "../../../../../lib/api"

type Params = { params: Promise<{ projectSlug: string; typeKey: string; slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const { projectSlug, typeKey, slug } = await params

    const project = await prisma.project.findUnique({ where: { slug: projectSlug } })
    if (!project) throw new ApiError(404, "not_found", `Project "${projectSlug}" not found.`)

    const contentType = await prisma.contentType.findUnique({
      where: { projectId_key: { projectId: project.id, key: typeKey } },
    })
    if (!contentType) throw new ApiError(404, "not_found", `Content type "${typeKey}" not found.`)

    const entry = await prisma.entry.findUnique({
      where: { contentTypeId_slug: { contentTypeId: contentType.id, slug } },
    })
    if (!entry || entry.status !== "PUBLISHED" || entry.published === null) {
      throw new ApiError(404, "not_found", `Entry "${slug}" not found.`)
    }

    return json({
      slug: entry.slug,
      publishedAt: entry.publishedAt,
      values: entry.published,
    })
  })
}
