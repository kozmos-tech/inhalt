import type { ApiKey } from "@/lib/keys/client"
import { listProjectKeys } from "@/lib/keys/server"
import { KeysPanel } from "./keys-panel"

// Server Component: loads the project's keys in-process and hands them to the
// client KeysPanel. It's rendered under a <Suspense> boundary in page.tsx, so
// this DB query streams in on its own and never blocks the rest of the
// dashboard (the Connection tab paints immediately).
export async function KeysSection() {
  // Surface a load failure (e.g. a session with no workspace yet) the same way
  // the client fetch used to, rather than crashing the route.
  let initialKeys: ApiKey[] = []
  let initialError: string | null = null
  try {
    initialKeys = await listProjectKeys()
  } catch (err) {
    initialError = err instanceof Error ? err.message : "Could not load keys."
  }

  return <KeysPanel initialKeys={initialKeys} initialError={initialError} />
}
