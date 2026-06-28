"use client"

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { GetStartedDialog } from "./get-started-dialog"

type GetStartedButtonProps = {
  className?: string
  children: ReactNode
}

// Wraps a "Get started" trigger and the modal it opens. Used in both the header
// and the closing CTA, so it takes the trigger's classes and label as props.
export function GetStartedButton({ className, children }: GetStartedButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <GetStartedDialog ref={ref} onClose={() => setOpen(false)} />
    </>
  )
}
