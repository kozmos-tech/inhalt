"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "./icons"

export function CopyButton({
  value,
  label,
  className = "",
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ? undefined : "Copy"}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15 " +
        className
      }
    >
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </button>
  )
}
