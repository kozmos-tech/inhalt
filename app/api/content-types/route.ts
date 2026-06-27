// Content types — collection.
//   GET  /api/content-types        list every content type in the project
//   POST /api/content-types        create one (its field definitions are validated)

import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { getProject } from "../../lib/project"
import { handle, json } from "../../lib/api"
import { fieldsSchema } from "../../lib/fields"

const createSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  fields: fieldsSchema,
})

export async function GET() {
  return handle(async () => {
    const project = await getProject()
    const contentTypes = await prisma.contentType.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
    })
    return json({ contentTypes })
  })
}

export async function POST(request: Request) {
  return handle(async () => {
    const project = await getProject()
    const body = createSchema.parse(await request.json())
    const contentType = await prisma.contentType.create({
      data: {
        projectId: project.id,
        key: body.key,
        name: body.name,
        fields: body.fields,
      },
    })
    return json({ contentType }, 201)
  })
}
