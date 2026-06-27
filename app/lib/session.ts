// Server-side session resolution for the management REST routes.
//
// requireSession() reads the better-auth session from the request cookies and
// throws the standard ApiError(401) envelope when there is none, so route
// handlers wrapped in handle() (lib/api.ts) get a consistent unauthorized
// response. This is the secure check — it hits the session store, unlike the
// optimistic cookie-only check in proxy.ts.

import { headers } from "next/headers"

import { auth } from "./auth"
import { ApiError } from "./api"

export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

export async function requireSession(): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new ApiError(401, "unauthorized", "Sign in to continue.")
  }
  return session
}
