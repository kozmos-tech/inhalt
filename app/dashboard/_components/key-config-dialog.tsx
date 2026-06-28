"use client"

import type { Ref } from "react"
import { useClipboard } from "@/lib/hooks/use-clipboard"
import { KEY_CONFIG } from "../utils/constants"

type KeyConfigDialogProps = {
  ref: Ref<HTMLDialogElement>
  onClose: () => void
}

// Shown only when asked for: the bearer-key config for clients that can't do the
// browser sign-in (scripts, server-to-server). The default Connection view stays
// a single URL.
export function KeyConfigDialog({ ref, onClose }: KeyConfigDialogProps) {
  const { copied, copy } = useClipboard()

  return (
    <dialog ref={ref} onClose={onClose}>
      <h2>Connect with an API key</h2>
      <p>
        For clients that can't sign in through the browser. Create a key in the
        API keys tab, then use this config and replace <code>YOUR_KEY</code>.
      </p>
      <div className="config-block">
        <div className="config-head">
          <span>mcp.json</span>
          <button type="button" onClick={() => copy(KEY_CONFIG, "key")}>
            {copied === "key" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre>{KEY_CONFIG}</pre>
      </div>
      <div className="dialog-actions">
        <button type="button" onClick={onClose}>
          Done
        </button>
      </div>
    </dialog>
  )
}
