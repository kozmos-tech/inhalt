// Server-side listing of the signed-in project's API keys, for the dashboard's
// initial render.
//
// This mirrors GET /api/keys but runs in-process during the server render, so
// the keys table arrives with the HTML - no client fetch and no loading spinner
// on first paint. Mutations (create/revoke) and post-mutation refreshes still
// go through the REST routes via lib/keys/client.

import { prisma } from "@/lib/prisma"
import { getProject } from "@/lib/project"
import type { ApiKey } from "@/lib/keys/client"

export async function listProjectKeys(): Promise<ApiKey[]> {
  const project = await getProject()
  const keys = await prisma.apiKey.findMany({
    where: { projectId: project.id, revokedAt: null },
    // Same safe columns the client uses; the hash and secret never leave here.
    select: { id: true, name: true, prefix: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  // Serialize Date -> ISO string so the array passes cleanly as a prop to the
  // client component and matches the ApiKey shape the client fetch returns.
  return keys.map((key) => ({ ...key, createdAt: key.createdAt.toISOString() }))
}
