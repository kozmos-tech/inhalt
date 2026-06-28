"use client"

import type { FormEvent, Ref } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

type CreateKeyDialogProps = {
  ref: Ref<HTMLDialogElement>
  newName: string
  onNewNameChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
  busy: boolean
  error: string | null
}

export function CreateKeyDialog({
  ref,
  newName,
  onNewNameChange,
  onSubmit,
  onCancel,
  busy,
  error,
}: CreateKeyDialogProps) {
  return (
    <dialog ref={ref} onClose={onCancel}>
      <form onSubmit={onSubmit}>
        <h2>Create API key</h2>
        <Input
          id="key-name"
          label="Name"
          hint="Give the key a name so you can recognize it later."
          autoFocus
          value={newName}
          onChange={(e) => onNewNameChange(e.target.value)}
          placeholder="e.g. Production or Claude Desktop"
        />
        {error && (
          <p role="alert">
            <strong>{error}</strong>
          </p>
        )}
        <div className="dialog-actions">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? (
              <span className="btn-busy">
                <Spinner />
                Creating
              </span>
            ) : (
              "Create key"
            )}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
