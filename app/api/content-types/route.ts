// Content types - collection.
//   GET  /api/content-types        list every content type in the project
//   POST /api/content-types        create one (its field definitions are validated)

import { z } from "zod"
import { getProject } from "@/lib/project"
import { handle, json } from "@/lib/http"
import { fieldsSchema } from "@/lib/content/fields"
import * as ops from "@/lib/content/operations"

const createBody = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  fields: fieldsSchema,
})

export async function GET() {
  return handle(async () => {
    const project = await getProject()
    const contentTypes = await ops.listContentTypes(project.id)
    return json({ contentTypes })
  })
}

export async function POST(request: Request) {
  return handle(async () => {
    const project = await getProject()
    const body = createBody.parse(await request.json())
    const contentType = await ops.createSchema(project.id, body.key, body.name, body.fields)
    return json({ contentType }, 201)
  })
}
