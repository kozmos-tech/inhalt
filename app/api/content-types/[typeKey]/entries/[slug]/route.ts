// Entries — single item.
//   GET    /api/content-types/:typeKey/entries/:slug   (?view=draft|published)
//   PATCH  /api/content-types/:typeKey/entries/:slug   typed patch -> draft
//   DELETE /api/content-types/:typeKey/entries/:slug

import { z } from "zod"
import { NextRequest } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { Prisma } from "../../../../../generated/prisma/client"
import { getProject } from "../../../../../lib/project"
import { handle, json, ApiError } from "../../../../../lib/api"
import { validateEntry } from "../../../../../lib/fields"
import { requireContentType, requireEntry } from "../../../../../lib/lookup"

type Params = { params: Promise<{ typeKey: string; slug: string }> }

const patchSchema = z.object({
  data: z.record(z.string(), z.unknown()),
})

export async function GET(request: NextRequest, { params }: Params) {
  return handle(async () => {
    const { typeKey, slug } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)
    const entry = await requireEntry(contentType.id, slug)

    const view = request.nextUrl.searchParams.get("view") ?? "draft"
    if (view !== "draft" && view !== "published") {
      throw new ApiError(400, "bad_request", "`view` must be `draft` or `published`.")
    }
    if (view === "published" && entry.published === null) {
      throw new ApiError(404, "not_found", "This entry has not been published.")
    }

    return json({ entry, values: view === "published" ? entry.published : entry.draft })
  })
}

export async function PATCH(request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey, slug } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)
    const entry = await requireEntry(contentType.id, slug)

    const body = patchSchema.parse(await request.json())
    const patch = validateEntry(contentType.fields, body.data, { partial: true })

    // Shallow-merge the typed patch onto the working draft. published is left
    // untouched until an explicit publish, so the draft now carries the
    // unpublished changes.
    const current = (entry.draft ?? {}) as Record<string, unknown>
    const merged = { ...current, ...patch }

    const updated = await prisma.entry.update({
      where: { id: entry.id },
      data: { draft: merged as Prisma.InputJsonValue },
    })
    return json({ entry: updated })
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey, slug } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)
    const entry = await requireEntry(contentType.id, slug)

    await prisma.entry.delete({ where: { id: entry.id } })
    return json({ deleted: true })
  })
}
