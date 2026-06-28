// OAuth 2.0 Authorization Server Metadata (RFC 8414).
//
// MCP clients discover the auth server by fetching this well-known path at the
// site root. better-auth's mcp plugin builds the document (issuer, authorize /
// token / registration endpoints under /api/auth/mcp/*); we just re-serve it
// here so it is reachable at the root the spec mandates.

import { oAuthDiscoveryMetadata } from "better-auth/plugins"

import { auth } from "@/lib/auth/server"

// Prisma + node:crypto run server-side only.
export const runtime = "nodejs"

export const GET = oAuthDiscoveryMetadata(auth)
