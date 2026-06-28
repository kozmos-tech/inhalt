"use client"

import { useEffect, useRef, useState } from "react"
import { useClipboard } from "@/lib/hooks/use-clipboard"
import { ENDPOINT, OAUTH_CONFIG } from "../utils/constants"
import { KeyConfigDialog } from "./key-config-dialog"

export function ConnectionPanel() {
  const { copied, copy } = useClipboard()
  const [showKey, setShowKey] = useState(false)
  const keyRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = keyRef.current
    if (!d) return
    if (showKey && !d.open) d.showModal()
    else if (!showKey && d.open) d.close()
  }, [showKey])

  return (
    <section>
      <p>
        Add this endpoint to your MCP client. It opens a browser for you to sign
        in, then exposes a typed tool for every content operation.
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
          <button type="button" onClick={() => copy(OAUTH_CONFIG, "config")}>
            {copied === "config" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre>{OAUTH_CONFIG}</pre>
      </div>

      <p>
        Using a client that can't sign in through the browser?{" "}
        <button type="button" className="linklike" onClick={() => setShowKey(true)}>
          Connect with an API key
        </button>
        .
      </p>

      <KeyConfigDialog ref={keyRef} onClose={() => setShowKey(false)} />
    </section>
  )
}
