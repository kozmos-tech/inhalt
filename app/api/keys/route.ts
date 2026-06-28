// API keys - collection.
//   GET  /api/keys    list active keys (never returns the hash or secret)
//   POST /api/keys    create a key; the full secret is returned exactly ONCE

import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { getProject } from "../../lib/project"
import { handle, json } from "../../lib/api"
import { generateKey, DEFAULT_SCOPES } from "../../lib/keys"

// Columns safe to expose. The hash never leaves the server and the plaintext
// secret is only ever returned inline from POST, below.
const publicFields = {
  id: true,
  name: true,
  prefix: true,
  scopes: true,
  lastUsedAt: true,
  revokedAt: true,
  createdAt: true,
} as const

const createSchema = z.object({
  name: z.string().min(1),
})

export async function GET() {
  return handle(async () => {
    const project = await getProject()
    const keys = await prisma.apiKey.findMany({
      where: { projectId: project.id, revokedAt: null },
      select: publicFields,
      orderBy: { createdAt: "desc" },
    })
    return json({ keys })
  })
}

export async function POST(request: Request) {
  return handle(async () => {
    const project = await getProject()
    const body = createSchema.parse(await request.json())
    const { secret, prefix, hash } = generateKey()

    const key = await prisma.apiKey.create({
      data: {
        projectId: project.id,
        name: body.name,
        prefix,
        hash,
        scopes: DEFAULT_SCOPES,
      },
      select: publicFields,
    })

    // `secret` is included here and nowhere else, ever.
    return json({ key: { ...key, secret } }, 201)
  })
}
