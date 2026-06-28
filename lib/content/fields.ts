// The typed-schema engine.
//
// A ContentType stores its field definitions as a JSON array. That single array
// drives everything: it is validated on its way in (so a content type can never
// hold a malformed definition), and it is compiled to a zod schema at runtime so
// every entry write is checked against real, typed fields and never freeform.
// The MCP server will reuse the same engine to describe its tools.

import { z } from "zod"

// --- field definitions (the shape stored in ContentType.fields) -------------

const baseField = {
  key: z.string().min(1),
  required: z.boolean().optional(),
}

const scalar = z.enum(["string", "number", "boolean"])

// A richtext value is always stored as a plain string; `format` only declares
// which markup that string holds so a client knows what to write and a renderer
// knows how to read it. It is metadata, not parsed or validated here. HTML is the
// default because it is served as-is; markdown is the easier shape for a model to
// emit cleanly inside JSON, and plaintext means no markup at all.
const richtextFormat = z
  .enum(["html", "markdown", "plaintext"])
  .default("html")
  .describe("Markup the richtext string holds: html (default), markdown, or plaintext.")

const fieldDef = z.discriminatedUnion("type", [
  z.object({ ...baseField, type: z.literal("string"), maxLength: z.number().int().positive().optional() }),
  z.object({ ...baseField, type: z.literal("richtext"), format: richtextFormat }),
  z.object({ ...baseField, type: z.literal("reference"), to: z.string().min(1) }),
  z.object({ ...baseField, type: z.literal("enum"), options: z.array(z.string().min(1)).min(1) }),
  z.object({ ...baseField, type: z.literal("list"), of: scalar.default("string") }),
])

export type FieldDef = z.infer<typeof fieldDef>

// The validator for a whole field-definition array. Rejects duplicate keys so a
// content type's fields stay addressable by key.
export const fieldsSchema = z
  .array(fieldDef)
  .refine(
    (fields) => new Set(fields.map((f) => f.key)).size === fields.length,
    { message: "Field keys must be unique." },
  )

// --- compiling definitions to a value schema --------------------------------

function scalarSchema(type: z.infer<typeof scalar>): z.ZodType {
  switch (type) {
    case "number":
      return z.number()
    case "boolean":
      return z.boolean()
    case "string":
      return z.string()
  }
}

function fieldSchema(field: FieldDef): z.ZodType {
  switch (field.type) {
    case "string": {
      const base = z.string()
      return field.maxLength ? base.max(field.maxLength) : base
    }
    case "richtext":
      return z.string()
    case "reference":
      return z.string()
    case "enum":
      return z.enum(field.options as [string, ...string[]])
    case "list":
      return z.array(scalarSchema(field.of))
  }
}

// Build a zod object that validates an entry's values against the field set.
// `partial` (used by PATCH) makes every field optional; otherwise required
// fields are enforced. Unknown keys are rejected so writes stay strictly typed.
export function compileFields(fields: FieldDef[], options: { partial?: boolean } = {}): z.ZodType {
  const shape: Record<string, z.ZodType> = {}
  for (const field of fields) {
    const schema = fieldSchema(field)
    shape[field.key] = field.required ? schema : schema.optional()
  }

  const object = z.strictObject(shape)
  return options.partial ? object.partial() : object
}

// Validate raw entry data against a content type's (raw JSON) field definitions.
// Throws a ZodError on bad fields or bad data; returns the parsed values.
export function validateEntry(
  fieldsJson: unknown,
  data: unknown,
  options: { partial?: boolean } = {},
): Record<string, unknown> {
  const fields = fieldsSchema.parse(fieldsJson)
  return compileFields(fields, options).parse(data) as Record<string, unknown>
}
