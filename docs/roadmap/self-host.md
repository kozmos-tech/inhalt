# Self-host roadmap

Inhalt positions as self-hostable: "one container, your database, your
keys. MIT licensed, end to end." The application code is in place, but the
packaging to actually run it as a self-contained container does not exist yet.

## TODO

### Container packaging
No `Dockerfile` or `docker-compose.yml` in the repo. Add:
- A production `Dockerfile` (build the Next app, run on the Node runtime - this
  build uses `proxy.ts`, not `middleware.ts`).
- A `docker-compose.yml` that brings up the app + a Postgres instance for a
  one-command local/self-host start (bring-your-own DB via `DATABASE_URL`).

### Bring-your-own config
Document and validate the required env at startup: `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Fail fast with a clear message when any
are missing.

### First-run / migrations
Decide how a fresh self-host instance gets its schema: run `prisma migrate deploy`
(switch from `db:push` to committed migrations) on container start, plus a path to
create the first user + workspace.

### Docs
A self-hosting guide (README section or `docs/self-host.md`): env vars, the
compose command, how to point an MCP client at the self-hosted `/mcp` endpoint.
