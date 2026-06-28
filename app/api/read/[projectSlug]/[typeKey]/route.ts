// Read API - list published entries (public, published content only).
//   GET /api/read/:projectSlug/:typeKey
//   GET /api/read/:projectSlug/:typeKey?field=value   filter by a typed field
//
// This surface is consumed by external frontends, so the project slug is in the
// path rather than resolved from auth context. It only ever serves the
// `published` copy; drafts are never visible here.

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { handle, json, ApiError } from "@/lib/http"

type Params = { params: Promise<{ projectSlug: string; typeKey: string }> }

// Query keys that control the response rather than filter fields.
const RESERVED = new Set(["limit", "offset"])

export async function GET(request: NextRequest, { params }: Params) {
  return handle(async () => {
    const { projectSlug, typeKey } = await params

    const project = await prisma.project.findUnique({ where: { slug: projectSlug } })
    if (!project) throw new ApiError(404, "not_found", `Project "${projectSlug}" not found.`)

    const contentType = await prisma.contentType.findUnique({
      where: { projectId_key: { projectId: project.id, key: typeKey } },
    })
    if (!contentType) throw new ApiError(404, "not_found", `Content type "${typeKey}" not found.`)

    const search = request.nextUrl.searchParams
    const limit = Math.min(Number(search.get("limit") ?? 50), 200)
    const offset = Number(search.get("offset") ?? 0)

    // Each remaining query param becomes a JSON-path filter on the published copy.
    const fieldFilters: Prisma.EntryWhereInput[] = []
    for (const [key, value] of search) {
      if (RESERVED.has(key)) continue
      fieldFilters.push({ published: { path: [key], equals: value } })
    }

    const entries = await prisma.entry.findMany({
      where: {
        contentTypeId: contentType.id,
        status: "PUBLISHED",
        ...(fieldFilters.length ? { AND: fieldFilters } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    })

    return json({
      entries: entries.map((entry) => ({
        slug: entry.slug,
        publishedAt: entry.publishedAt,
        values: entry.published,
      })),
    })
  })
}
