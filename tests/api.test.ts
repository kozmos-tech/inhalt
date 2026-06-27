// Every route wraps its body in handle(), so this one function decides the status
// code and error envelope for the whole API. These tests pin that mapping without
// touching the database: handle() just takes a thunk returning a Response.

import { test } from "node:test"
import assert from "node:assert/strict"
import { z } from "zod"

import { handle, ApiError, json } from "../app/lib/api"

async function bodyOf(res: Response): Promise<{ status: number; body: { error?: { code?: string; issues?: unknown } } }> {
  return { status: res.status, body: await res.json() }
}

test("handle passes a successful Response straight through", async () => {
  const res = await handle(async () => json({ ok: true }, 201))
  const { status, body } = await bodyOf(res)
  assert.equal(status, 201)
  assert.deepEqual(body, { ok: true })
})

test("handle maps an ApiError to its status and code", async () => {
  const res = await handle(async () => {
    throw new ApiError(404, "not_found", "No such thing.")
  })
  const { status, body } = await bodyOf(res)
  assert.equal(status, 404)
  assert.equal(body.error?.code, "not_found")
})

test("handle maps a ZodError to 400 with the issues attached", async () => {
  const res = await handle(async () => {
    z.object({ name: z.string() }).parse({}) // throws ZodError
    return json({})
  })
  const { status, body } = await bodyOf(res)
  assert.equal(status, 400)
  assert.equal(body.error?.code, "validation_error")
  assert.ok(Array.isArray(body.error?.issues))
})

test("handle maps Prisma P2002 (unique) to 409", async () => {
  const res = await handle(async () => {
    throw { code: "P2002" }
  })
  assert.equal((await bodyOf(res)).status, 409)
})

test("handle maps Prisma P2025 (missing record) to 404", async () => {
  const res = await handle(async () => {
    throw { code: "P2025" }
  })
  assert.equal((await bodyOf(res)).status, 404)
})

test("handle maps an unknown throw to 500", async () => {
  const res = await handle(async () => {
    throw new Error("boom")
  })
  const { status, body } = await bodyOf(res)
  assert.equal(status, 500)
  assert.equal(body.error?.code, "internal_error")
})
