# Getting started

Connect an MCP client to Inhalt and start operating on content. No SDK.

## 1. Get a bearer key

Sign in to the dashboard and create an API key. The full secret is shown **once**
at creation — copy it then; it is never displayed again. The key authenticates your
MCP client and carries the scopes it is allowed to use.

## 2. Connect the endpoint

Add one block to your MCP client's config, with your key in the `Authorization`
header:

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

Inhalt exposes your whole content tree as typed tools. The client reads your schema
on connect.

## 3. Operate on content

The client reads the schema, finds the right entry, and proposes a clean patch
against real, typed fields — never freeform text. Every change is checked against
your schema.

## 4. Save and publish

Edits land as a **draft**. Publishing copies the draft to the published copy and
pushes it to your live read API in one step. There is no version history: the model
is drafts → save → publish.

## Reading published content

Published content is available over a clean, fast read API, resolved by project and
type slug — no session or key required for public reads:

```
GET /api/read/<project>/<type>
GET /api/read/<project>/<type>/<slug>
```
