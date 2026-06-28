// Key generation/hashing. The plaintext secret is shown once and never stored;
// only the sha-256 hash and a short display prefix persist. These tests pin the
// secret format and the one-way hashing the bearer auth relies on.

import { test } from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"

import { generateKey, hashSecret, DEFAULT_SCOPES } from "../lib/keys/tokens"

test("generateKey produces the documented secret format", () => {
  const { secret } = generateKey()
  assert.match(secret, /^inh_live_[0-9a-f]{48}$/)
})

test("generateKey's prefix is the secret's leading display chars", () => {
  const { secret, prefix } = generateKey()
  assert.match(prefix, /^inh_live_[0-9a-f]{4}$/)
  assert.ok(secret.startsWith(prefix))
})

test("generateKey's stored hash matches hashSecret of the plaintext", () => {
  const { secret, hash } = generateKey()
  assert.equal(hash, hashSecret(secret))
})

test("generateKey is non-deterministic (fresh secret each call)", () => {
  const a = generateKey()
  const b = generateKey()
  assert.notEqual(a.secret, b.secret)
  assert.notEqual(a.hash, b.hash)
})

test("hashSecret is a deterministic sha-256 hex digest", () => {
  const expected = createHash("sha256").update("inh_live_test").digest("hex")
  assert.equal(hashSecret("inh_live_test"), expected)
  assert.equal(hashSecret("inh_live_test"), hashSecret("inh_live_test"))
  assert.match(hashSecret("x"), /^[0-9a-f]{64}$/)
})

test("DEFAULT_SCOPES grants every type and every action", () => {
  assert.deepEqual(DEFAULT_SCOPES.contentTypes, ["*"])
  assert.deepEqual(
    [...DEFAULT_SCOPES.actions].sort(),
    ["create", "delete", "patch", "publish", "query", "read"],
  )
})
