"use client"

import { useEffect, useRef, useState } from "react"
import { createKey, listKeys, revokeKey, type ApiKey } from "@/lib/keys/client"
import { CreateKeyDialog } from "./create-key-dialog"
import { RevealKeyDialog } from "./reveal-key-dialog"
import { formatDate } from "../utils/format"

// The Keys tab's interactive surface. It's seeded with keys fetched on the
// server (see keys-section.tsx) and owns everything that needs the client: the
// create/reveal dialogs, optimistic revoke, and the post-mutation refresh.
type KeysPanelProps = {
  initialKeys: ApiKey[]
  initialError: string | null
}

export function KeysPanel({ initialKeys, initialError }: KeysPanelProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [revealed, setRevealed] = useState<ApiKey | null>(null)

  const createRef = useRef<HTMLDialogElement>(null)
  const revealRef = useRef<HTMLDialogElement>(null)

  // Drive the native <dialog> modals from state: opening one gives us a backdrop,
  // focus trapping, and Esc-to-close for free, and keeps the page underneath
  // perfectly still (no layout shift when a key is created).
  useEffect(() => {
    const d = createRef.current
    if (!d) return
    if (creating && !d.open) d.showModal()
    else if (!creating && d.open) d.close()
  }, [creating])

  useEffect(() => {
    const d = revealRef.current
    if (!d) return
    if (revealed?.secret && !d.open) d.showModal()
    else if (!revealed?.secret && d.open) d.close()
  }, [revealed])

  // Re-pull the list after a mutation so the table reflects the server's truth.
  async function refresh() {
    try {
      setKeys(await listKeys())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load keys.")
    }
  }

  function openCreate() {
    setError(null)
    setNewName("")
    setCreating(true)
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return

    setBusy(true)
    setError(null)
    try {
      const created = await createKey(newName)
      setCreating(false)
      setNewName("")
      setRevealed(created)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create key.")
    } finally {
      setBusy(false)
    }
  }

  async function onRevoke(id: string) {
    setError(null)
    // Optimistic: drop it from the list immediately, restore on failure.
    const previous = keys
    setKeys((current) => current.filter((key) => key.id !== id))
    try {
      await revokeKey(id)
    } catch (err) {
      setKeys(previous)
      setError(err instanceof Error ? err.message : "Could not revoke key.")
    }
  }

  // While the create dialog is open its own error line shows the failure, so
  // keep the panel-level alert quiet.
  const panelError = creating ? null : error

  return (
    <section>
      <div className="section-head">
        <p>
          Each MCP client authenticates with its own key. The secret is shown
          once, right after you create it.
        </p>
        <button type="button" className="primary" onClick={openCreate}>
          Create new key
        </button>
      </div>

      {panelError && (
        <p role="alert">
          <strong>{panelError}</strong>
        </p>
      )}

      {keys.length === 0 ? (
        <p className="empty">
          No keys yet. Create your first key to connect an MCP client.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Key</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td>
                  <code>{key.prefix}••••••••</code>
                </td>
                <td>{formatDate(key.createdAt)}</td>
                <td className="row-action">
                  <button type="button" onClick={() => onRevoke(key.id)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CreateKeyDialog
        ref={createRef}
        newName={newName}
        onNewNameChange={setNewName}
        onSubmit={onCreate}
        onCancel={() => setCreating(false)}
        busy={busy}
        error={error}
      />

      <RevealKeyDialog
        ref={revealRef}
        secret={revealed?.secret ?? null}
        onClose={() => setRevealed(null)}
      />
    </section>
  )
}
