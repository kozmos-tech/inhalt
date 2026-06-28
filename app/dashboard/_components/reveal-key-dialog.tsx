"use client"

import type { Ref } from "react"
import { useClipboard } from "@/lib/hooks/use-clipboard"
import { Button } from "@/components/ui/button"

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
        <input
          className="copy-field"
          readOnly
          value={secret ?? ""}
          aria-label="Your new API key"
          onFocus={(e) => e.currentTarget.select()}
        />
      </div>
      <div className="dialog-actions">
        <Button variant="primary" onClick={() => secret && copy(secret)}>
          {copied ? "Copied" : "Copy key"}
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </dialog>
  )
}
