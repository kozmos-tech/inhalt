// Client-side data access for the dashboard's API-keys section.
//
// These talk to the session-scoped /api/keys routes: the server resolves the
// caller's workspace from their session cookie (see lib/project.ts), so every
// call here only ever reads or mutates the signed-in user's own keys. This
// replaces the old localStorage mock — keys created here are real and will
// authenticate against the MCP server.

export type ApiKey = {
  id: string
  name: string
  prefix: string
  // ISO timestamp from the API (Prisma DateTime serialized to JSON).
  createdAt: string
  // The full secret is returned exactly once, from createKey's POST response,
  // and is never stored or shown again.
  secret?: string
}

async function parse(res: Response): Promise<unknown> {
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      (body as { error?: { message?: string } } | null)?.error?.message ??
      "Something went wrong. Please try again."
    throw new Error(message)
  }
  return body
}

export async function listKeys(): Promise<ApiKey[]> {
  const body = (await parse(await fetch("/api/keys"))) as { keys: ApiKey[] }
  return body.keys
}

export async function createKey(name: string): Promise<ApiKey> {
  const body = (await parse(
    await fetch("/api/keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() || "Untitled key" }),
    }),
  )) as { key: ApiKey }
  return body.key
}

export async function revokeKey(id: string): Promise<void> {
  await parse(await fetch(`/api/keys/${encodeURIComponent(id)}`, { method: "DELETE" }))
}
