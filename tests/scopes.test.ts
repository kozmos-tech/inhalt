// The per-key permission gate. parseScopes narrows untrusted JSON (and must fail
// closed on garbage); assertScope is what every MCP tool calls before doing work.

import { test } from "node:test"
import assert from "node:assert/strict"

import { parseScopes, assertScope } from "../app/lib/scopes"
import { ApiError } from "../app/lib/api"

// --- parseScopes: fail closed on anything malformed --------------------------

test("parseScopes keeps a well-formed value", () => {
  const scopes = parseScopes({ contentTypes: ["post"], actions: ["read", "create"] })
  assert.deepEqual(scopes, { contentTypes: ["post"], actions: ["read", "create"] })
})

test("parseScopes denies everything on null / non-object", () => {
  assert.deepEqual(parseScopes(null), { contentTypes: [], actions: [] })
  assert.deepEqual(parseScopes("nope"), { contentTypes: [], actions: [] })
  assert.deepEqual(parseScopes(undefined), { contentTypes: [], actions: [] })
})

test("parseScopes filters out non-string entries", () => {
  const scopes = parseScopes({ contentTypes: ["post", 7, null], actions: ["read", {}] })
  assert.deepEqual(scopes, { contentTypes: ["post"], actions: ["read"] })
})

test("parseScopes treats missing arrays as empty", () => {
  assert.deepEqual(parseScopes({}), { contentTypes: [], actions: [] })
})

// --- assertScope: allow vs. 403 ----------------------------------------------

const full = { contentTypes: ["*"], actions: ["read", "create", "delete"] }

test("assertScope allows a granted action on a wildcard type", () => {
  assert.doesNotThrow(() => assertScope(full, "read", "post"))
  assert.doesNotThrow(() => assertScope(full, "create", "anything"))
})

test("assertScope allows an action with no content type (e.g. schema.read)", () => {
  assert.doesNotThrow(() => assertScope(full, "read"))
})

test("assertScope throws 403 when the action is not granted", () => {
  assert.throws(
    () => assertScope(full, "publish", "post"),
    (err: unknown) => err instanceof ApiError && err.status === 403 && err.code === "forbidden",
  )
})

test("assertScope throws 403 when the content type is not granted", () => {
  const narrow = { contentTypes: ["post"], actions: ["read"] }
  assert.doesNotThrow(() => assertScope(narrow, "read", "post"))
  assert.throws(
    () => assertScope(narrow, "read", "author"),
    (err: unknown) => err instanceof ApiError && err.status === 403,
  )
})

test("assertScope checks the action before the content type", () => {
  // action ungranted -> reject even though the type is wildcarded
  const noWrite = { contentTypes: ["*"], actions: ["read"] }
  assert.throws(() => assertScope(noWrite, "delete", "post"), ApiError)
})
