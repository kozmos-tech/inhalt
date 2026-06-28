"use client"

import { useEffect, useRef, useState } from "react"
import { useClipboard } from "@/lib/hooks/use-clipboard"
import { Button } from "@/components/ui/button"
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
        <input
          className="copy-field"
          readOnly
          value={ENDPOINT}
          aria-label="MCP endpoint"
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button onClick={() => copy(ENDPOINT, "endpoint")}>
          {copied === "endpoint" ? "Copied" : "Copy"}
        </Button>
      </div>

      <h3>Client configuration</h3>
      <div className="config-block">
        <div className="config-head">
          <span>mcp.json</span>
          <Button onClick={() => copy(OAUTH_CONFIG, "config")}>
            {copied === "config" ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre>{OAUTH_CONFIG}</pre>
      </div>

      <p>
        Using a client that can't sign in through the browser?{" "}
        <Button variant="link" onClick={() => setShowKey(true)}>
          Connect with an API key
        </Button>
        .
      </p>

      <KeyConfigDialog ref={keyRef} onClose={() => setShowKey(false)} />
    </section>
  )
}
