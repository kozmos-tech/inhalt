# Inhalt

**The CMS your AI tools can run.**

Inhalt is an open-source, MCP-native CMS. Instead of a traditional admin UI or a REST/GraphQL SDK, the content layer is exposed entirely through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). Any MCP client connects to the Inhalt server and you create and edit content just by chatting.

The protocol is the API. There is no SDK and no glue code. The client reads your content schema, finds the right entry, and proposes a clean, typed patch against real fields, never freeform text.

- **Website:** [inhalt.tech](https://inhalt.tech)
- **MCP endpoint:** `https://app.inhalt.tech/mcp`
- **License:** MIT
- **Self-hostable:** one container, your database, your keys. A hosted edge is also available.

## How it works

Three steps, no SDK.

1. **Connect the endpoint.** Add one block to your MCP config. Inhalt exposes your whole content tree as typed tools.
2. **Operate on content.** The client reads the schema, finds the right entry, and proposes a clean patch against real, typed fields.
3. **Save and publish.** Every change is checked against your schema, saved, and pushed to your live read API in one step.

See [docs/getting-started.md](docs/getting-started.md) for the MCP config and a full walkthrough.

## Features

| Feature | Description |
| --- | --- |
| **MCP-native** | The protocol is the API. Read, query, and patch content through tools any client already understands. |
| **Typed schemas** | Model content once. Clients work strictly inside your fields, validated and never freeform. |
| **Drafts and review** | Stage edits, preview them, and publish only when they are ready. |
| **Headless delivery** | Query from anywhere over a clean, fast read API. |
| **Scoped access** | Grant a client exactly the entries and actions it should touch. |
| **Self-host** | One container, your database, your keys. MIT licensed, end to end. |

## Supported clients

Inhalt works with every MCP client, including Claude, Cursor, VS Code, Zed, Windsurf, and Cline.

## Documentation

- [Getting started](docs/getting-started.md) — connect an MCP client and operate on content.
- [Development](docs/development.md) — run the repo locally, environment, and scripts.
- [Copy & tone](docs/copy-style.md) — writing guidelines for product copy.
- [Roadmap](docs/roadmap/) — planned work ([auth](docs/roadmap/auth.md), [self-host](docs/roadmap/self-host.md)).

## License

[MIT](LICENSE)
