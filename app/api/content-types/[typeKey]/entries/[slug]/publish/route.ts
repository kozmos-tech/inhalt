// Publish an entry.
//   POST /api/content-types/:typeKey/entries/:slug/publish
//
// Copies the working draft to the published copy and stamps publishedAt. There
// is no version history: the model stays at drafts -> save -> publish.

import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { getProject } from "@/lib/project"
import { handle, json } from "@/lib/http"
import { requireContentType, requireEntry } from "@/lib/content/lookup"

type Params = { params: Promise<{ typeKey: string; slug: string }> }

export async function POST(_request: Request, { params }: Params) {
  return handle(async () => {
    const { typeKey, slug } = await params
    const project = await getProject()
    const contentType = await requireContentType(project.id, typeKey)
    const entry = await requireEntry(contentType.id, slug)

    const published = await prisma.entry.update({
      where: { id: entry.id },
      data: {
        published: entry.draft as Prisma.InputJsonValue,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    })
    return json({ entry: published })
  })
}
