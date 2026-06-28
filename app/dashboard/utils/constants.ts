// Static connection details rendered on the dashboard's Connection tab.

// Inlined at build time from .env (NEXT_PUBLIC_ so it reaches the client bundle).
export const ENDPOINT = process.env.NEXT_PUBLIC_MCP_ENDPOINT ?? ""

export const CONFIG = `{
  "mcpServers": {
    "inhalt": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}`
