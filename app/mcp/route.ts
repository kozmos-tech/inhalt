// Inhalt MCP server.
//
// The protocol IS the API: this exposes the content layer as eight typed
// tools, one per content operation. Transport is Streamable HTTP (stateless,
// no Redis) via mcp-handler; every request authenticates a bearer ApiKey and
// every tool is gated by that key's scopes. The tools themselves are thin - // they resolve auth + scope, then delegate to lib/operations, which is the
// single implementation shared with the REST routes. Writes are validated by
// the field engine (lib/content/fields), never freeform.

import { z } from "zod"
import { ZodError } from "zod"
import { createMcpHandler, withMcpAuth } from "mcp-handler"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js"

import { ApiError } from "@/lib/http"
import { authenticateBearer } from "@/lib/auth/bearer"
import { parseScopes, assertScope, type ScopeAction } from "@/lib/keys/scopes"
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

// Resolve the bearer secret to a key + project, exposing them to tools via
// authInfo.extra. Returning undefined makes withMcpAuth answer 401.
async function verifyToken(_req: Request, bearerToken?: string): Promise<AuthInfo | undefined> {
  const auth = await authenticateBearer(bearerToken)
  if (!auth || !bearerToken) return undefined
  return {
    token: bearerToken,
    clientId: auth.keyId,
    scopes: parseScopes(auth.scopes).actions,
    extra: { projectId: auth.projectId, scopes: auth.scopes },
  }
}

const authed = withMcpAuth(handler, verifyToken, { required: true })

export { authed as GET, authed as POST }
