"use client"

import type { Ref } from "react"
import Link from "next/link"
import { useClipboard } from "@/lib/hooks/use-clipboard"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@/components/ui/icons"
import { OAUTH_CONFIG } from "@/app/dashboard/utils/constants"

type GetStartedDialogProps = {
  ref: Ref<HTMLDialogElement>
  onClose: () => void
}

// The "Get started" modal. There is no install step beyond pointing an MCP
// client at the server, so the modal leads with that single action and offers
// the browser dashboard as a secondary path.
export function GetStartedDialog({ ref, onClose }: GetStartedDialogProps) {
  const { copied, copy } = useClipboard()

  return (
    <dialog ref={ref} onClose={onClose} className="lp-start">
      <h2>You&apos;re basically done</h2>
      <p>
        Inhalt runs inside your MCP client. Add the server below, sign in once
        when your browser opens, then create and edit content just by chatting.
      </p>

      <div className="config-block">
        <div className="config-head">
          <span>mcp.json</span>
          <Button onClick={() => copy(OAUTH_CONFIG, "config")}>
            {copied === "config" ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre>{OAUTH_CONFIG}</pre>
      </div>

      <p className="lp-start-note">Prefer a dashboard in your browser?</p>
      <div className="dialog-actions">
        <button
          type="button"
          className="lp-btn lp-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <Link href="/signup" className="lp-btn lp-btn-primary">
          Continue to the app
          <ArrowRightIcon size={15} />
        </Link>
      </div>
    </dialog>
  )
}
