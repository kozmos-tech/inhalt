"use client"

import type { Ref } from "react"
import { useClipboard } from "@/lib/hooks/use-clipboard"

type RevealKeyDialogProps = {
  ref: Ref<HTMLDialogElement>
  secret: string | null
  onClose: () => void
}

export function RevealKeyDialog({ ref, secret, onClose }: RevealKeyDialogProps) {
  const { copied, copy } = useClipboard()

  return (
    <dialog ref={ref} onClose={onClose}>
      <h2>Your new API key</h2>
      <p>
        Copy this key now and store it somewhere safe. For security, it will not
        be shown again.
      </p>
      <div className="key-reveal">
        <code>{secret}</code>
      </div>
      <div className="dialog-actions">
        <button
          type="button"
          className="primary"
          onClick={() => secret && copy(secret)}
        >
          {copied ? "Copied" : "Copy key"}
        </button>
        <button type="button" onClick={onClose}>
          Done
        </button>
      </div>
    </dialog>
  )
}
