# @kozmos-tech/inhalt

MCP bridge for [Inhalt](https://inhalt.tech) — the CMS your AI tools can run.

Inhalt's MCP server is hosted and remote. This package is a tiny launcher that
bridges any stdio MCP client to the hosted endpoint, so clients that only speak
stdio (or launch servers via `npx`) can connect with one config block.

## Usage

Add Inhalt to your MCP client config:

```json
{
  "mcpServers": {
    "inhalt": {
      "command": "npx",
      "args": ["-y", "@kozmos-tech/inhalt"]
    }
  }
}
```

That's it. On first run the bridge opens a browser to sign in (OAuth); after that
your session is cached. The client then sees Inhalt's content tools — read and
query the schema, list and get entries, create, patch, publish, and delete.

## Authentication

- **OAuth (default):** the first run opens a browser to authorize the connection.
- **API key:** for scripts and headless setups, mint a scoped key in the Inhalt
  dashboard and pass it as a bearer token via your client's header settings.

## Self-hosting

Point the bridge at your own Inhalt instance with an environment variable:

```json
{
  "mcpServers": {
    "inhalt": {
      "command": "npx",
      "args": ["-y", "@kozmos-tech/inhalt"],
      "env": { "INHALT_MCP_URL": "https://cms.example.com/mcp" }
    }
  }
}
```

`INHALT_MCP_URL` defaults to `https://inhalt.tech/mcp`.

## License

MIT
