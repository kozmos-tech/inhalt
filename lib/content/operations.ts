// The content operations, independent of transport.
//
// Each function takes an already-resolved projectId plus arguments and returns
// plain data (or throws an ApiError). The REST route handlers and the MCP tools
// both call these, so there is exactly one implementation of "create an entry",
// "publish an entry", etc. - the field engine (lib/content/fields) stays the single
// contract for what a write may contain.

import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { ApiError } from "@/lib/http"
import { validateEntry, fieldsSchema } from "@/lib/content/fields"
import { requireContentType, requireEntry } from "@/lib/content/lookup"

const MAX_LIMIT = 200

// Prisma reports a unique-constraint break as P2002; we translate it into a
// clean 409 so both transports get a useful message instead of a generic 500.
function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002"
}

// --- content types: read ----------------------------------------------------

export function listContentTypes(projectId: string) {
  return prisma.contentType.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  })
}

// schema.read: the typed shape a client needs before it can write. Trimmed to
// the fields that describe the model, not internal ids/timestamps. Field defs are
// re-parsed so declared defaults (e.g. a richtext field's `format`) are filled in,
// letting a client see exactly what shape each field expects.
export async function readSchema(projectId: string) {
  const types = await listContentTypes(projectId)
  return types.map((t) => ({ key: t.key, name: t.name, fields: fieldsSchema.parse(t.fields) }))
}

// --- content types: write ---------------------------------------------------

// schema.create: define a new content type. Field definitions are validated by
// the same engine that guards entry writes, so a type can never be born with a
// malformed schema. A duplicate key surfaces as a 409.
export async function createSchema(projectId: string, key: string, name: string, fields: unknown) {
  const parsed = fieldsSchema.parse(fields)
  try {
    return await prisma.contentType.create({
      data: { projectId, key, name, fields: parsed as Prisma.InputJsonValue },
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(409, "conflict", `A content type with key "${key}" already exists.`)
    }
    throw error
  }
}

// schema.update: change a content type's display name and/or its field set. The
// key stays immutable (it addresses the type and its entries). At least one of
// name/fields must be given. Note: editing fields does not migrate existing
// entry data - stored values are only re-checked on the next entry write.
export async function updateSchema(
  projectId: string,
  typeKey: string,
  patch: { name?: string; fields?: unknown },
) {
  const contentType = await requireContentType(projectId, typeKey)
  if (patch.name === undefined && patch.fields === undefined) {
    throw new ApiError(400, "bad_request", "Provide at least one of `name` or `fields`.")
  }
  const fields = patch.fields !== undefined ? fieldsSchema.parse(patch.fields) : undefined
  return prisma.contentType.update({
    where: { id: contentType.id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(fields !== undefined ? { fields: fields as Prisma.InputJsonValue } : {}),
    },
  })
}

// schema.delete: remove a content type. Postgres cascades to its entries, so
// this is destructive - it is gated behind its own scope.
export async function deleteSchema(projectId: string, typeKey: string) {
  const contentType = await requireContentType(projectId, typeKey)
  await prisma.contentType.delete({ where: { id: contentType.id } })
  return { deleted: true, key: typeKey }
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
