// Content types - single item.
//   GET    /api/content-types/:typeKey      fetch one
//   PATCH  /api/content-types/:typeKey      update name / fields
//   DELETE /api/content-types/:typeKey      remove (cascades to its entries)

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getProject } from "@/lib/project"
import { handle, json } from "@/lib/http"
import { fieldsSchema } from "@/lib/content/fields"
import { requireContentType } from "@/lib/content/lookup"

type Params = { params: Promise<{ typeKey: string }> }

const patchSchema = z
  .object({
    name: z.string().min(1).optional(),
    fields: fieldsSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.fields !== undefined, {
    message: "Provide at least one of `name` or `fields`.",
  })

export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)
    return json({ contentType })
  })
}

export async function PATCH(request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)
    const body = patchSchema.parse(await request.json())

    const updated = await prisma.contentType.update({
      where: { id: contentType.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.fields !== undefined ? { fields: body.fields } : {}),
      },
    })
    return json({ contentType: updated })
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)
    await prisma.contentType.delete({ where: { id: contentType.id } })
    return json({ deleted: true })
  })
}
