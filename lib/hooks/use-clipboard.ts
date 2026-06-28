"use client"

// Copy-to-clipboard with a short-lived "copied" acknowledgement.
//
// `copied` holds the key of the most recently copied target (or null), so a
// single hook instance can back several copy buttons - pass a distinct key per
// target and compare against it (e.g. `copied === "endpoint"`). Targets that
// don't need to disambiguate can omit the key and check `copied !== null`.

import { useCallback, useState } from "react"

export function useClipboard(resetMs = 1500) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = useCallback(
    async (text: string, key = "default") => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(null), resetMs)
      } catch {
        // Clipboard can be blocked (e.g. insecure context); fail quietly.
      }
    },
    [resetMs],
  )

  return { copied, copy }
}
