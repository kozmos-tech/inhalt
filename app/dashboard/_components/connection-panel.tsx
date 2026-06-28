"use client"

import { useClipboard } from "@/lib/hooks/use-clipboard"
import { CONFIG, ENDPOINT } from "../utils/constants"

export function ConnectionPanel() {
  const { copied, copy } = useClipboard()

  return (
    <section>
      <p>
        Point any MCP client at this endpoint, then authenticate with a key from
        the API keys tab.
      </p>

      <h3>Endpoint</h3>
      <div className="copy-row">
        <code>{ENDPOINT}</code>
        <button type="button" onClick={() => copy(ENDPOINT, "endpoint")}>
          {copied === "endpoint" ? "Copied" : "Copy"}
        </button>
      </div>

      <h3>Client configuration</h3>
      <div className="config-block">
        <div className="config-head">
          <span>mcp.json</span>
          <button type="button" onClick={() => copy(CONFIG, "config")}>
            {copied === "config" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre>{CONFIG}</pre>
      </div>

      <p>
        Replace <code>YOUR_KEY</code> with a key from the API keys tab.
      </p>
    </section>
  )
}
