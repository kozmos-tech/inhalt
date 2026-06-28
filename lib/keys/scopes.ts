// Per-key access scoping.
//
// An ApiKey carries `scopes` = { contentTypes: ["post", "*"], actions: [...] }.
// Every MCP tool declares the action it performs (and the content type it
// touches, when applicable); `assertScope` rejects anything the key was not
// granted. `"*"` in contentTypes means every type. Mirrors DEFAULT_SCOPES in
// lib/keys/tokens.ts, which is what freshly minted keys persist.

import { ApiError } from "@/lib/http"

export type Scopes = {
  contentTypes: string[]
  actions: string[]
}

export type ScopeAction = "read" | "query" | "create" | "patch" | "publish" | "delete"

// Narrow the JSON stored on ApiKey.scopes into the shape we rely on, tolerating
// a malformed value by denying everything rather than throwing.
export function parseScopes(value: unknown): Scopes {
  if (typeof value !== "object" || value === null) return { contentTypes: [], actions: [] }
  const v = value as Record<string, unknown>
  const contentTypes = Array.isArray(v.contentTypes) ? v.contentTypes.filter((s): s is string => typeof s === "string") : []
  const actions = Array.isArray(v.actions) ? v.actions.filter((s): s is string => typeof s === "string") : []
  return { contentTypes, actions }
}

export function assertScope(scopes: Scopes, action: ScopeAction, typeKey?: string): void {
  if (!scopes.actions.includes(action)) {
    throw new ApiError(403, "forbidden", `This key is not allowed to ${action}.`)
  }
  if (typeKey !== undefined && !scopes.contentTypes.includes("*") && !scopes.contentTypes.includes(typeKey)) {
    throw new ApiError(403, "forbidden", `This key cannot access content type "${typeKey}".`)
  }
}
