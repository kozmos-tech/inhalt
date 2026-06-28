// Content types - single item.
//   GET    /api/content-types/:typeKey      fetch one
//   PATCH  /api/content-types/:typeKey      update name / fields
//   DELETE /api/content-types/:typeKey      remove (cascades to its entries)

import { z } from "zod"
import { getProject } from "@/lib/project"
import { handle, json } from "@/lib/http"
import { fieldsSchema } from "@/lib/content/fields"
import { requireContentType } from "@/lib/content/lookup"
import * as ops from "@/lib/content/operations"

type Params = { params: Promise<{ typeKey: string }> }

const patchBody = z
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
    const body = patchBody.parse(await request.json())
    const contentType = await ops.updateSchema(project.id, typeKey, body)
    return json({ contentType })
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey } = await params
    const project = await getProject()
    await ops.deleteSchema(project.id, typeKey)
    return json({ deleted: true })
  })
}
