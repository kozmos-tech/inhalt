// Static connection details rendered on the dashboard's Connection tab.

// Inlined at build time from .env (NEXT_PUBLIC_ so it reaches the client bundle).
export const ENDPOINT = process.env.NEXT_PUBLIC_MCP_ENDPOINT ?? ""

// OAuth path: clients that support remote MCP auth need only the URL. They open
// a browser, you sign in, and the client is granted access to your project.
export const OAUTH_CONFIG = `{
  "mcpServers": {
    "inhalt": {
      "url": "${ENDPOINT}"
    }
  }
}`

// API key path: for clients that cannot do the OAuth browser flow (most scripts
// and server-to-server callers). The bearer key carries the same access.
export const KEY_CONFIG = `{
  "mcpServers": {
    "inhalt": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}`
