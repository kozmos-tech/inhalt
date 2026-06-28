// The content operations, independent of transport.
//
// Each function takes an already-resolved projectId plus arguments and returns
// plain data (or throws an ApiError). The REST route handlers and the MCP tools
// both call these, so there is exactly one implementation of "create an entry",
// "publish an entry", etc. - the field engine (lib/fields) stays the single
// contract for what a write may contain.

import { prisma } from "./prisma"
import { Prisma } from "../generated/prisma/client"
import { ApiError } from "./api"
import { validateEntry } from "./fields"
import { requireContentType, requireEntry } from "./lookup"

const MAX_LIMIT = 200

// --- content types ----------------------------------------------------------

export function listContentTypes(projectId: string) {
  return prisma.contentType.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  })
}

// schema.read: the typed shape a client needs before it can write. Trimmed to
// the fields that describe the model, not internal ids/timestamps.
export async function readSchema(projectId: string) {
  const types = await listContentTypes(projectId)
  return types.map((t) => ({ key: t.key, name: t.name, fields: t.fields }))
}

// --- entries: read ----------------------------------------------------------

type ListOptions = { status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; limit?: number; offset?: number }

export async function listEntries(projectId: string, typeKey: string, options: ListOptions = {}) {
  const contentType = await requireContentType(projectId, typeKey)
  return prisma.entry.findMany({
    where: { contentTypeId: contentType.id, ...(options.status ? { status: options.status } : {}) },
    orderBy: { createdAt: "desc" },
    take: Math.min(options.limit ?? 50, MAX_LIMIT),
    skip: options.offset ?? 0,
  })
}

// Filter by typed fields against the working draft copy (the set a client edits).
export async function queryEntries(
  projectId: string,
  typeKey: string,
  filters: Record<string, string | number | boolean>,
) {
  const contentType = await requireContentType(projectId, typeKey)
  const and: Prisma.EntryWhereInput[] = Object.entries(filters).map(([key, value]) => ({
    draft: { path: [key], equals: value },
  }))
  return prisma.entry.findMany({
    where: { contentTypeId: contentType.id, ...(and.length ? { AND: and } : {}) },
    orderBy: { createdAt: "desc" },
  })
}

export async function getEntry(
  projectId: string,
  typeKey: string,
  slug: string,
  view: "draft" | "published" = "draft",
) {
  const contentType = await requireContentType(projectId, typeKey)
  const entry = await requireEntry(contentType.id, slug)
  if (view === "published" && entry.published === null) {
    throw new ApiError(404, "not_found", "This entry has not been published.")
  }
  return { entry, values: view === "published" ? entry.published : entry.draft }
}

// --- entries: write ---------------------------------------------------------

export async function createEntry(
  projectId: string,
  typeKey: string,
  slug: string,
  data: unknown,
) {
  const contentType = await requireContentType(projectId, typeKey)
  const draft = validateEntry(contentType.fields, data)
  return prisma.entry.create({
    data: { contentTypeId: contentType.id, slug, draft: draft as Prisma.InputJsonValue },
  })
}

export async function patchEntry(
  projectId: string,
  typeKey: string,
  slug: string,
  data: unknown,
) {
  const contentType = await requireContentType(projectId, typeKey)
  const entry = await requireEntry(contentType.id, slug)
  const patch = validateEntry(contentType.fields, data, { partial: true })

  // Shallow-merge the typed patch onto the working draft; published is left
  // untouched until an explicit publish, so the draft now holds the unpublished
  // changes.
  const current = (entry.draft ?? {}) as Record<string, unknown>
  const merged = { ...current, ...patch }
  return prisma.entry.update({
    where: { id: entry.id },
    data: { draft: merged as Prisma.InputJsonValue },
  })
}

export async function publishEntry(projectId: string, typeKey: string, slug: string) {
  const contentType = await requireContentType(projectId, typeKey)
  const entry = await requireEntry(contentType.id, slug)
  return prisma.entry.update({
    where: { id: entry.id },
    data: {
      published: entry.draft as Prisma.InputJsonValue,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })
}

export async function deleteEntry(projectId: string, typeKey: string, slug: string) {
  const contentType = await requireContentType(projectId, typeKey)
  const entry = await requireEntry(contentType.id, slug)
  await prisma.entry.delete({ where: { id: entry.id } })
  return { deleted: true, slug }
}
