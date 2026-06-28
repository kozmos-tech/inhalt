# Inhalt documentation

Inhalt is an open-source, MCP-native CMS. The content layer is exposed through the
Model Context Protocol, so any MCP client can read and edit your content directly.
The protocol is the API. There is no SDK.

## Using Inhalt

- [Getting started](getting-started.md) - connect an MCP client and operate on content.
- [Concepts](concepts.md) - projects, content types, entries, and the draft/publish model.
- [API reference](api/README.md) - the two surfaces you talk to from outside the dashboard:
  - [Read API](api/read.md) - the public HTTP API that serves your published content.
  - [MCP API](api/mcp.md) - the typed tool surface your AI client uses to edit content.

## Contributing

- [Development](development.md) - run the repo locally, environment, and scripts.
- [Code organization](code-organization.md) - project layout and where new code goes.
- [Copy & tone](copy-style.md) - writing guidelines for product copy.
- [Roadmap](roadmap/) - planned work ([auth](roadmap/auth.md), [self-host](roadmap/self-host.md)).
