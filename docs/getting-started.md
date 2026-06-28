# Getting started

Connect an MCP client to Inhalt and start operating on content. No SDK.

## 1. Connect a client

There are two ways to authenticate. Pick whichever your client supports. See the
[MCP API](api/mcp.md) for the full details on both.

### Sign in with your account (recommended)

Most MCP clients (Claude, Cursor, and others) can sign in through your browser.
Give the client just the endpoint URL, approve the login page it opens, and it
gets access to your project. Nothing to copy or store:

```json
{
  "mcpServers": {
    "inhalt": {
      "url": "https://mcp.inhalt.tech"
    }
  }
}
```

### Connect with an API key

For clients that cannot do the browser sign-in (most scripts and server-to-server
callers), use a bearer key. Sign in to the dashboard and create an API key. The
full secret is shown **once** at creation - copy it then; it is never displayed
again. Add it to the config in an `Authorization` header:

```json
{
  "mcpServers": {
    "inhalt": {
      "url": "https://mcp.inhalt.tech",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}
```

Either way, Inhalt exposes your whole content tree as typed tools, and the client
reads your schema on connect.

## 2. Operate on content

The client reads the schema, finds the right entry, and proposes a clean patch
against real, typed fields - never freeform text. Every change is checked against
your schema.

## 3. Save and publish

Edits land as a **draft**. Publishing copies the draft to the published copy and
pushes it to your live read API in one step. There is no version history: the model
is drafts → save → publish.

## Reading published content

Published content is available over a clean, fast read API, resolved by project and
type slug - no session or key required for public reads:

```
GET /api/read/<project>/<type>
GET /api/read/<project>/<type>/<slug>
```
