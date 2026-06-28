// OAuth 2.0 Protected Resource Metadata (RFC 9728).
//
// Points MCP clients from the protected resource (the /mcp server) to the
// authorization server that guards it. The MCP route's 401 also references this
// path in its WWW-Authenticate header, so a client with only the URL can find
// its way to the login flow.

import { oAuthProtectedResourceMetadata } from "better-auth/plugins"

import { auth } from "@/lib/auth/server"

// Prisma + node:crypto run server-side only.
export const runtime = "nodejs"

export const GET = oAuthProtectedResourceMetadata(auth)
