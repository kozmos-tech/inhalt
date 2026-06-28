# MCP API

Inhalt exposes your whole content layer over the Model Context Protocol. An MCP
client (Claude, Cursor, and others) connects to one endpoint and gets a set of
typed tools for reading and editing content. The protocol is the API: there is no
SDK.

Endpoint: `https://app.inhalt.tech/mcp`

Transport is Streamable HTTP. Every request must carry a bearer key.

## Connecting

Create an API key in the dashboard (the secret is shown once, copy it then), and
add one block to your client's MCP config:

```json
{
  "mcpServers": {
    "inhalt": {
      "url": "https://app.inhalt.tech/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}
```

The client reads your schema on connect, then sees the tools below.

## Authentication and scopes

The bearer key identifies your project and carries scopes that decide what it can
do. A scope has two parts:

- **actions** - which operations are allowed: `read`, `query`, `create`, `patch`,
  `publish`, `delete`, `schema:write` (create/edit content types), and
  `schema:delete` (drop a content type).
- **content types** - which types the key may touch. `*` means all types.

Freshly created keys are granted every action except `schema:delete` on every
content type. `schema:delete` cascades to every entry of the type, so a key must
be granted it deliberately. A tool call the key is not scoped for fails with
`forbidden`.

## Tools

### Entries

| Tool | Action | Description |
|------|--------|-------------|
| `entries.list`   | read    | List entries of a type. Optional `status` filter and paging. |
| `entries.query`  | query   | Find entries whose fields match given values (matched against the draft). |
| `entries.get`    | read    | Fetch one entry by slug. `view` picks `draft` (default) or `published`. |
| `entries.create` | create  | Create a new draft entry. Data is validated against the type's fields. |
| `entries.patch`  | patch   | Apply a typed patch to an entry's draft. Only the given fields change. |
| `entries.publish`| publish | Copy an entry's draft to its published copy (served by the Read API). |
| `entries.delete` | delete  | Delete an entry permanently. |

### Schema

| Tool | Action | Description |
|------|--------|-------------|
| `schema.read`   | read         | List the project's content types and their field definitions. |
| `schema.create` | schema:write | Define a new content type from a set of typed fields. |
| `schema.update` | schema:write | Change a type's name and/or fields. The key is immutable. |
| `schema.delete` | schema:delete| Delete a content type and every entry it holds. |

### Inputs

- `typeKey` - the content type's key, e.g. `post`.
- `name` - a content type's display name (`schema.create` / `schema.update`).
- `fields` - an array of typed field definitions for `schema.create` /
  `schema.update`. Each field is `{ key, type, required? }` plus per-type extras.
  The types are `string` (optional `maxLength`), `richtext`, `reference`
  (`to`: a target `typeKey`), `enum` (`options`: string list), and `list`
  (`of`: `string` | `number` | `boolean`).
- `slug` - the entry's slug.
- `data` - an object of field values. It is validated against the content type;
  unknown fields and wrong types are rejected.
- `status` - one of `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- `view` - `draft` or `published`.
- `filters` - an object of field/value pairs for `entries.query`.
- `limit` / `offset` - paging.

Editing a type's fields does not migrate existing entries. Stored values are only
re-checked on the next write to that entry, so a removed or retyped field can
leave older entries holding data that no longer matches the schema.

## The draft and publish model

Edits (`create`, `patch`) always land on a **draft**. Nothing is public until you
call `entries.publish`, which copies the draft to the published copy that the
[Read API](read.md) serves. There is no version history: the model is drafts ->
save -> publish.

## Errors

Tool failures come back as a text result with `isError: true`. Expected ones are
readable: `not_found`, `forbidden`, and `validation_error` (with the specific
field issues) for bad data.
