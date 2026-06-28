# Concepts

The whole of Inhalt is four ideas. Once they click, the [Getting started](getting-started.md)
walkthrough and the [API reference](api/README.md) read as just the operations on
them.

## Project

A project is your workspace and the unit of isolation. Each account owns one, and
everything below (content types, entries, API keys) lives inside it. A project is
addressed by its slug, which is how the [Read API](api/read.md) reaches your content
from anywhere:

```
GET /api/read/<project>/...
```

## Content type

A content type is the shape of one kind of content, like a `post` or an `author`.
It has a key (`post`), a display name, and a set of typed **fields**. The fields
are the contract: every entry of the type is validated against them, so a client
always works inside real, typed fields and never freeform text.

Each field has a `key`, a `type`, and whether it is `required`. The types are:

- `string` - a short text value (optional `maxLength`).
- `richtext` - a longer body. Its `format` (`html`, `markdown`, or `plaintext`)
  declares what markup the string holds. See [rich text](api/mcp.md#rich-text).
- `reference` - a link to another entry (`to` names the target type).
- `enum` - one value from a fixed list of `options`.
- `list` - many values `of` `string`, `number`, or `boolean`.

You define types with the schema tools (`schema.create`, `schema.update`). Editing
a type's fields does not migrate existing entries; stored values are re-checked on
the next write to that entry.

## Entry

An entry is one piece of content of a given type, identified by its `slug` (unique
within the type). Its `values` are the field values, validated against the type.
Entries are what you create, edit, and read.

## Draft and published

Every entry has two copies: a **draft** you edit and a **published** copy the
public [Read API](api/read.md) serves.

- Edits (`create`, `patch`) always land on the draft. Nothing is public yet.
- `publish` copies the draft over the published copy, pushing it live in one step.
- The Read API only ever returns the published copy. An entry that has never been
  published is a `404` there.

There is no version history. The model is drafts -> save -> publish.

## Two API surfaces

Those concepts are reached through two surfaces, covered in the
[API reference](api/README.md):

- The **[MCP API](api/mcp.md)** is the typed tool surface your AI client uses to
  read and edit content. Authenticated, and the way you make changes.
- The **[Read API](api/read.md)** is the public, key-less HTTP API that serves your
  published content to a website or app.
