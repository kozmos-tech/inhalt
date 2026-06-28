# Auth roadmap

Current state: real user accounts + sessions via **better-auth** (email + password
only). Each signup gets its own workspace (`Project.ownerId`), the management REST
routes are session-scoped, and the MCP surface keeps its bearer-key auth. The items
below are deferred follow-ups.

## TODO

### Per-key scope narrowing
`POST /api/keys` always grants `DEFAULT_SCOPES` ([app/lib/keys.ts:12](../../app/lib/keys.ts#L12)) - every minted key gets all types + all actions. Add a validated optional `scopes`
input to the create route, using `DEFAULT_SCOPES` as the maximum grant, so callers
can mint narrowed keys. This also lights up the MCP `403` scope-denied path, which
can't currently be exercised against a real key.

### Email verification
Not enabled (`emailAndPassword.enabled` only). Turn on better-auth's email
verification, wire a transactional email sender, and gate sign-in / dashboard access
on verified status.

### Social login - Google & GitHub
No OAuth providers yet. Add Google and GitHub via better-auth's social providers
(client IDs/secrets in `.env`, callback routes through the existing
`/api/auth/[...all]` handler). Account-link to existing email/password users where
the email matches.

### Forgot / reset password
No password reset flow. Add the request-reset + reset-with-token endpoints
(better-auth supports this) plus the UI on the login page (the "Forgot?" link was
removed earlier and should come back once this is real).

### Other
- Decide multi-project-per-user (today one workspace per account).
- The seeded "default" project has `ownerId = null` (orphan) - fine for self-host,
  not reachable via the dashboard.
