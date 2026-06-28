// Bearer-token generation and hashing for API keys.
//
// The plaintext secret is shown exactly once at creation and never stored; we
// keep a one-way sha-256 hash (used to authenticate MCP clients later) plus a
// short display prefix.

import { createHash, randomBytes } from "node:crypto"

// Default grant for a freshly created key: every content type, every action.
// Scopes are stored as JSON on ApiKey and narrowed per key later.
export const DEFAULT_SCOPES = {
  contentTypes: ["*"],
  actions: ["read", "query", "create", "patch", "publish", "delete"],
} as const

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex")
}

export function generateKey(): { secret: string; prefix: string; hash: string } {
  const token = randomBytes(24).toString("hex") // 48 hex chars
  const secret = `inh_live_${token}`
  return {
    secret,
    prefix: `inh_live_${token.slice(0, 4)}`,
    hash: hashSecret(secret),
  }
}
