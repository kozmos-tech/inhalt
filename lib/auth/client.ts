// better-auth browser client.
//
// Used by the client components (login/signup forms, dashboard) to talk to the
// auth handler at /api/auth. baseURL is inferred from the current origin, so no
// configuration is needed here.

import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
