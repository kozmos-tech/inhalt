// Bearer-token authentication for the MCP server.
//
// This is where tenancy is resolved for the MCP surface: the bearer secret in
// the Authorization header identifies an ApiKey, which belongs to a Project.
// (The management REST routes resolve their tenant differently - from the user's
// session; see lib/project.ts.)

import { prisma } from "./prisma"
import { hashSecret } from "./keys"

export type AuthenticatedKey = {
  keyId: string
  projectId: string
  scopes: unknown // raw ApiKey.scopes JSON; parsed by lib/scopes
}

// Resolve a plaintext bearer secret to its (non-revoked) key + project, or null
// when it does not match an active key. We look up by the stored sha-256 hash;
// the plaintext is never persisted.
export async function authenticateBearer(secret: string | undefined): Promise<AuthenticatedKey | null> {
  if (!secret) return null

  const key = await prisma.apiKey.findUnique({ where: { hash: hashSecret(secret) } })
  if (!key || key.revokedAt !== null) return null

  // Best-effort usage stamp; a failure here must not block the request.
  await prisma.apiKey
    .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
    .catch(() => undefined)

  return { keyId: key.id, projectId: key.projectId, scopes: key.scopes }
}
