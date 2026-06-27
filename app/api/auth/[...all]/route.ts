// better-auth request handler.
//
// Mounts every better-auth endpoint (sign-up, sign-in, sign-out, get-session,
// ...) under /api/auth/*. The catch-all segment forwards the whole subtree to
// the library's handler.

import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "../../../lib/auth"

// better-auth uses node:crypto and the Prisma client; keep it off the edge.
export const runtime = "nodejs"

export const { GET, POST } = toNextJsHandler(auth)
