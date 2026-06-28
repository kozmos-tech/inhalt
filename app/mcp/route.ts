// Inhalt MCP server.
//
// The protocol IS the API: this exposes the content layer as typed tools, one
// per content operation - reading and writing both entries and the schema that
// types them. Transport is Streamable HTTP (stateless,
// no Redis) via mcp-handler; every request authenticates with either an OAuth
// access token (interactive clients) or a bearer ApiKey (scripts), and every
// tool is gated by the caller's scopes. The tools themselves are thin - // they resolve auth + scope, then delegate to lib/operations, which is the
// single implementation shared with the REST routes. Writes are validated by
// the field engine (lib/content/fields), never freeform.

import { z } from "zod"
import { ZodError } from "zod"
import { createMcpHandler, withMcpAuth } from "mcp-handler"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js"

import { ApiError } from "@/lib/http"
import { auth } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"
import { authenticateBearer } from "@/lib/auth/bearer"
import { parseScopes, assertScope, type ScopeAction, type Scopes } from "@/lib/keys/scopes"
import { fieldsSchema } from "@/lib/content/fields"
import * as ops from "@/lib/content/operations"

// Prisma + node:crypto run server-side only.
export const runtime = "nodejs"

// --- tool result helpers ----------------------------------------------------

type Extra = { authInfo?: AuthInfo }

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
}

// Map a thrown error to an MCP tool error the client can read. ApiError and
// ZodError carry the useful, expected failures (not found, forbidden, bad
// fields); anything else is reported generically and logged server-side.
function fail(error: unknown) {
  if (error instanceof ApiError) {
    return { content: [{ type: "text" as const, text: `${error.code}: ${error.message}` }], isError: true }
  }
  if (error instanceof ZodError) {
    return {
      content: [{ type: "text" as const, text: `validation_error: ${JSON.stringify(error.issues)}` }],
      isError: true,
    }
  }
  console.error("MCP tool error:", error)
  return { content: [{ type: "text" as const, text: "internal_error: something went wrong." }], isError: true }
}

// Resolve the authenticated context (set by withMcpAuth -> verifyToken below),
// enforce the tool's scope, run it, and shape the result. One wrapper keeps
// every tool body a single delegating line.
async function run<T>(
  extra: Extra,
  action: ScopeAction,
  typeKey: string | undefined,
  fn: (projectId: string) => Promise<T>,
) {
  try {
    const info = extra.authInfo
    const projectId = info?.extra?.projectId
    if (typeof projectId !== "string") {
      throw new ApiError(401, "unauthorized", "Missing or invalid credentials.")
    }
    assertScope(parseScopes(info?.extra?.scopes), action, typeKey)
    return ok(await fn(projectId))
  } catch (error) {
    return fail(error)
  }
}

// --- shared input fragments -------------------------------------------------

const typeKey = z.string().min(1)
const name = z.string().min(1)
const slug = z.string().min(1)
const data = z.record(z.string(), z.unknown())

// --- tools ------------------------------------------------------------------

function registerTools(server: McpServer) {
  server.registerTool(
    "schema.read",
    { description: "List the project's content types and their typed field definitions.", inputSchema: {} },
    async (_args, extra: Extra) => run(extra, "read", undefined, (p) => ops.readSchema(p)),
  )

  server.registerTool(
    "schema.create",
    {
      description:
        "Define a new content type. `fields` is an array of typed field definitions (string, richtext, reference, enum, list).",
      inputSchema: { typeKey, name, fields: fieldsSchema },
    },
    // No per-type gate: the type does not exist yet, so creation is governed by
    // the schema:write action alone.
    async (args, extra: Extra) =>
      run(extra, "schema:write", undefined, (p) => ops.createSchema(p, args.typeKey, args.name, args.fields)),
  )

  server.registerTool(
    "schema.update",
    {
      description:
        "Update a content type's name and/or fields. The key is immutable. Editing fields does not migrate existing entries.",
      inputSchema: { typeKey, name: name.optional(), fields: fieldsSchema.optional() },
    },
    async (args, extra: Extra) =>
      run(extra, "schema:write", args.typeKey, (p) =>
        ops.updateSchema(p, args.typeKey, { name: args.name, fields: args.fields }),
      ),
  )

  server.registerTool(
    "schema.delete",
    {
      description: "Delete a content type. This permanently removes the type and every entry it holds.",
      inputSchema: { typeKey },
    },
    async (args, extra: Extra) =>
      run(extra, "schema:delete", args.typeKey, (p) => ops.deleteSchema(p, args.typeKey)),
  )

  server.registerTool(
    "entries.list",
    {
      description: "List entries of a content type. Optionally filter by status and paginate.",
      inputSchema: {
        typeKey,
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
        limit: z.number().int().positive().optional(),
        offset: z.number().int().nonnegative().optional(),
      },
    },
    async (args, extra: Extra) =>
      run(extra, "read", args.typeKey, (p) =>
        ops.listEntries(p, args.typeKey, { status: args.status, limit: args.limit, offset: args.offset }),
      ),
  )

  server.registerTool(
    "entries.query",
    {
      description: "Find entries whose typed fields match the given values (matched against the working draft).",
      inputSchema: {
        typeKey,
        filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
      },
    },
    async (args, extra: Extra) =>
      run(extra, "query", args.typeKey, (p) => ops.queryEntries(p, args.typeKey, args.filters)),
  )

  server.registerTool(
    "entries.get",
    {
      description: "Fetch one entry by slug. `view` selects the draft (default) or published copy.",
      inputSchema: { typeKey, slug, view: z.enum(["draft", "published"]).optional() },
    },
    async (args, extra: Extra) =>
      run(extra, "read", args.typeKey, (p) => ops.getEntry(p, args.typeKey, args.slug, args.view ?? "draft")),
  )

  server.registerTool(
    "entries.create",
    {
      description: "Create a new draft entry. `data` is validated against the content type's fields.",
      inputSchema: { typeKey, slug, data },
    },
    async (args, extra: Extra) =>
      run(extra, "create", args.typeKey, (p) => ops.createEntry(p, args.typeKey, args.slug, args.data)),
  )

  server.registerTool(
    "entries.patch",
    {
      description: "Apply a typed patch to an entry's working draft. Only the given fields change.",
      inputSchema: { typeKey, slug, data },
    },
    async (args, extra: Extra) =>
      run(extra, "patch", args.typeKey, (p) => ops.patchEntry(p, args.typeKey, args.slug, args.data)),
  )

  server.registerTool(
    "entries.publish",
    {
      description: "Publish an entry: copy its working draft to the published copy served by the read API.",
      inputSchema: { typeKey, slug },
    },
    async (args, extra: Extra) =>
      run(extra, "publish", args.typeKey, (p) => ops.publishEntry(p, args.typeKey, args.slug)),
  )

  server.registerTool(
    "entries.delete",
    {
      description: "Delete an entry permanently.",
      inputSchema: { typeKey, slug },
    },
    async (args, extra: Extra) =>
      run(extra, "delete", args.typeKey, (p) => ops.deleteEntry(p, args.typeKey, args.slug)),
  )
}

// --- transport + auth -------------------------------------------------------

const handler = createMcpHandler(
  registerTools,
  { serverInfo: { name: "inhalt", version: "0.1.0" } },
  { disableSse: true },
)

// An OAuth access token authenticates the human owner, so it gets full access to
// their own project. Minted API keys keep their finer-grained per-key scopes.
const FULL_SCOPES: Scopes = {
  contentTypes: ["*"],
  actions: ["read", "query", "create", "patch", "publish", "delete", "schema:write", "schema:delete"],
}

// The project an authenticated user owns. Mirrors lib/project.ts's resolution
// but is keyed by userId, since the OAuth token carries only the user (no
// session). The first-created project wins, matching the management surface.
async function projectForUser(userId: string) {
  return prisma.project.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: "asc" } })
}

// Resolve a request to a project + scopes, exposed to tools via authInfo.extra.
// Two credentials are accepted: an OAuth 2.0 access token (interactive clients
// that signed in through the browser) or a bearer API key (scripts, server to
// server). Returning undefined makes withMcpAuth answer 401; every tool is still
// gated by scopes in run().
async function verifyToken(req: Request, bearerToken?: string): Promise<AuthInfo | undefined> {
  // OAuth: validate the access token and map its user to their project.
  const session = await auth.api.getMcpSession({ headers: req.headers }).catch(() => null)
  if (session) {
    const project = await projectForUser(session.userId)
    if (project) {
      return {
        token: session.accessToken,
        clientId: session.clientId,
        scopes: FULL_SCOPES.actions,
        extra: { projectId: project.id, scopes: FULL_SCOPES },
      }
    }
  }

  // API key: resolve the bearer secret to its key + project.
  const key = await authenticateBearer(bearerToken)
  if (key && bearerToken) {
    return {
      token: bearerToken,
      clientId: key.keyId,
      scopes: parseScopes(key.scopes).actions,
      extra: { projectId: key.projectId, scopes: key.scopes },
    }
  }

  return undefined
}

const authed = withMcpAuth(handler, verifyToken, { required: true })

// On a 401, point clients at our protected-resource metadata so a client that
// has only the URL can discover the OAuth server and start the login flow
// (RFC 9728 WWW-Authenticate challenge).
const resourceMetadataUrl = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/.well-known/oauth-protected-resource`

async function authedWithChallenge(req: Request): Promise<Response> {
  const res = await authed(req)
  if (res.status !== 401) return res
  const headers = new Headers(res.headers)
  headers.set("WWW-Authenticate", `Bearer resource_metadata="${resourceMetadataUrl}"`)
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}

export { authedWithChallenge as GET, authedWithChallenge as POST }
