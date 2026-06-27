# Inhalt

**The CMS your AI tools can run.**

Inhalt is an open-source, MCP-native CMS. Instead of a traditional admin UI or a REST/GraphQL SDK, the content layer is exposed entirely through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). Any MCP client connects to the Inhalt server and you create and edit content just by chatting.

The protocol is the API. There is no SDK and no glue code. The client reads your content schema, finds the right entry, and proposes a clean, typed patch against real fields, never freeform text.

- **Website:** [inhalt.tech](https://inhalt.tech)
- **MCP endpoint:** `https://api.inhalt.tech/mcp`
- **License:** MIT
- **Self-hostable:** one container, your database, your keys. A hosted edge is also available.

## How it works

Three steps, no SDK.

1. **Connect the endpoint.** Add one block to your MCP config. Inhalt exposes your whole content tree as typed tools.
2. **Operate on content.** The client reads the schema, finds the right entry, and proposes a clean patch against real, typed fields.
3. **Save and publish.** Every change is checked against your schema, saved, and pushed to your live read API in one step.

### Example MCP config

```json
{
  "mcpServers": {
    "inhalt": {
      "url": "https://api.inhalt.tech/mcp",
      "headers": {
        "Authorization": "Bearer ••••"
      }
    }
  }
}
```

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

## Getting started

This repository is a [Next.js](https://nextjs.org) application. To run it locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run eslint
```

## License

[MIT](https://opensource.org/licenses/MIT)
