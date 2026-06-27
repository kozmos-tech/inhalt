// Entries — collection, scoped to a content type.
//   GET  /api/content-types/:typeKey/entries   list (?status=, ?limit=, ?offset=)
//   POST /api/content-types/:typeKey/entries   create a draft (validated)

import { z } from "zod"
import { NextRequest } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { Prisma } from "../../../../generated/prisma/client"
import { getProject } from "../../../../lib/project"
import { handle, json } from "../../../../lib/api"
import { validateEntry } from "../../../../lib/fields"
import { requireContentType } from "../../../../lib/lookup"

type Params = { params: Promise<{ typeKey: string }> }

const createSchema = z.object({
  slug: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
})

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])

export async function GET(request: NextRequest, { params }: Params) {
  return handle(async () => {
    const { typeKey } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)

    const search = request.nextUrl.searchParams
    const statusParam = search.get("status")
    const status = statusParam ? statusSchema.parse(statusParam) : undefined
    const limit = Math.min(Number(search.get("limit") ?? 50), 200)
    const offset = Number(search.get("offset") ?? 0)

    const entries = await prisma.entry.findMany({
      where: { contentTypeId: contentType.id, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    })
    return json({ entries })
  })
}

export async function POST(request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)

    const body = createSchema.parse(await request.json())
    const draft = validateEntry(contentType.fields, body.data)

    const entry = await prisma.entry.create({
      data: {
        contentTypeId: contentType.id,
        slug: body.slug,
        draft: draft as Prisma.InputJsonValue,
      },
    })
    return json({ entry }, 201)
  })
}
