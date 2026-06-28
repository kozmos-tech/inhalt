// The field engine is the contract behind "writes are typed, never freeform":
// a ContentType's field array is validated on the way in, then compiled to a zod
// schema that every entry write must pass. These tests pin both halves.

import { test } from "node:test"
import assert from "node:assert/strict"
import { ZodError } from "zod"

import { fieldsSchema, compileFields, validateEntry, type FieldDef } from "../lib/content/fields"

// --- fieldsSchema: the definition itself must be well-formed -----------------

test("fieldsSchema accepts a valid mixed field set", () => {
  const fields = [
    { key: "title", type: "string", required: true, maxLength: 120 },
    { key: "body", type: "richtext" },
    { key: "author", type: "reference", to: "author" },
    { key: "status", type: "enum", options: ["draft", "live"] },
    { key: "tags", type: "list", of: "string" },
  ]
  const parsed = fieldsSchema.parse(fields)
  assert.equal(parsed.length, 5)
})

test("fieldsSchema rejects duplicate field keys", () => {
  const fields = [
    { key: "title", type: "string" },
    { key: "title", type: "richtext" },
  ]
  assert.throws(() => fieldsSchema.parse(fields), ZodError)
})

test("fieldsSchema rejects an unknown field type", () => {
  assert.throws(() => fieldsSchema.parse([{ key: "x", type: "datetime" }]), ZodError)
})

test("fieldsSchema requires `to` on a reference and `options` on an enum", () => {
  assert.throws(() => fieldsSchema.parse([{ key: "a", type: "reference" }]), ZodError)
  assert.throws(() => fieldsSchema.parse([{ key: "b", type: "enum", options: [] }]), ZodError)
})

test("fieldsSchema defaults a list's `of` to string", () => {
  const [list] = fieldsSchema.parse([{ key: "tags", type: "list" }]) as Extract<FieldDef, { type: "list" }>[]
  assert.equal(list.of, "string")
})

test("fieldsSchema defaults a richtext field's `format` to html", () => {
  const [body] = fieldsSchema.parse([{ key: "body", type: "richtext" }]) as Extract<
    FieldDef,
    { type: "richtext" }
  >[]
  assert.equal(body.format, "html")
})

// --- compileFields: the schema entry values are checked against --------------

// Only real field kinds: string/richtext/reference/enum/list. Scalars like number
// exist only as a list's element type, never as a standalone field.
const fields: FieldDef[] = [
  { key: "title", type: "string", required: true, maxLength: 5 },
  { key: "body", type: "richtext", format: "html" },
  { key: "author", type: "reference", to: "author" },
  { key: "status", type: "enum", options: ["draft", "live"] },
  { key: "scores", type: "list", of: "number" },
]

test("compileFields enforces required fields", () => {
  const schema = compileFields(fields)
  assert.throws(() => schema.parse({ body: "hi" }), ZodError) // missing required `title`
  assert.doesNotThrow(() => schema.parse({ title: "hi" }))
})

test("compileFields enforces string maxLength", () => {
  const schema = compileFields(fields)
  assert.throws(() => schema.parse({ title: "way too long" }), ZodError)
})

test("compileFields type-checks each field kind", () => {
  const schema = compileFields(fields)
  assert.throws(() => schema.parse({ title: "ok", body: 123 }), ZodError) // richtext is a string
  assert.throws(() => schema.parse({ title: "ok", status: "archived" }), ZodError) // not an enum option
  assert.throws(() => schema.parse({ title: "ok", scores: ["a"] }), ZodError) // list of numbers
  assert.doesNotThrow(() =>
    schema.parse({ title: "ok", body: "hello", author: "jane", status: "draft", scores: [1, 2] }),
  )
})

test("compileFields rejects unknown keys (strict)", () => {
  const schema = compileFields(fields)
  assert.throws(() => schema.parse({ title: "ok", surprise: true }), ZodError)
})

test("compileFields partial mode drops the required constraint", () => {
  const schema = compileFields(fields, { partial: true })
  assert.doesNotThrow(() => schema.parse({ body: "hi" })) // `title` may be omitted
  // but supplied fields are still type-checked
  assert.throws(() => schema.parse({ title: "way too long" }), ZodError)
})

// --- validateEntry: the public entry-point both transports call --------------

test("validateEntry returns parsed values on success", () => {
  const values = validateEntry(fields, { title: "ok", body: "hello" })
  assert.deepEqual(values, { title: "ok", body: "hello" })
})

test("validateEntry throws ZodError on a bad write", () => {
  assert.throws(() => validateEntry(fields, { body: "no title" }), ZodError)
})

test("validateEntry partial mode allows a sparse patch", () => {
  const values = validateEntry(fields, { scores: [9] }, { partial: true })
  assert.deepEqual(values, { scores: [9] })
})
