// Static connection details rendered on the dashboard's Connection tab.

export const ENDPOINT = "https://app.inhalt.tech/mcp"

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
