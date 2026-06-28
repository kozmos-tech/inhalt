// API keys - single item.
//   DELETE /api/keys/:id    revoke (soft delete: sets revokedAt)
//
// Revoking is a soft delete so an audit trail and lastUsedAt survive. A revoked
// key drops out of the GET /api/keys listing and will fail auth once the MCP
// server checks it.

import { prisma } from "../../../lib/prisma"
import { getProject } from "../../../lib/project"
import { handle, json, ApiError } from "../../../lib/api"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const { id } = await params
    const project = await getProject()

    const key = await prisma.apiKey.findFirst({
      where: { id, projectId: project.id },
    })
    if (!key) throw new ApiError(404, "not_found", "API key not found.")
    if (key.revokedAt) return json({ revoked: true })

    await prisma.apiKey.update({
      where: { id: key.id },
      data: { revokedAt: new Date() },
    })
    return json({ revoked: true })
  })
}
