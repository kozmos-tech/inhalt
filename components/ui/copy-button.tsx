"use client"

import { useClipboard } from "@/lib/hooks/use-clipboard"
import { Button } from "./button"
import { CheckIcon, CopyIcon } from "./icons"

type CopyButtonProps = {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label, className = "" }: CopyButtonProps) {
  const { copied, copy } = useClipboard(1400)
  const isCopied = copied !== null

  return (
    <Button
      onClick={() => copy(value)}
      aria-label={label ? undefined : "Copy"}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15 " +
        className
      }
    >
      {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      {label ? <span>{isCopied ? "Copied" : label}</span> : null}
    </Button>
  )
}
