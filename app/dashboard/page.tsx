"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { createKey, listKeys, revokeKey, type ApiKey } from "@/lib/keys/client"
import { signOut, useSession } from "@/lib/auth/client"
import { ConnectionPanel } from "./_components/connection-panel"
import { CreateKeyDialog } from "./_components/create-key-dialog"
import { DashboardTabs } from "./_components/dashboard-tabs"
import { KeysPanel } from "./_components/keys-panel"
import { RevealKeyDialog } from "./_components/reveal-key-dialog"
import type { DashboardTab } from "./utils/types"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [revealed, setRevealed] = useState<ApiKey | null>(null)
  const [tab, setTab] = useState<DashboardTab>("connection")

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

  const email = session?.user?.email ?? "guest@inhalt.tech"

  const refresh = useCallback(async () => {
    try {
      setKeys(await listKeys())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load keys.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Load the signed-in user's keys once on mount. refresh() only setStates after
  // its awaited fetch resolves (not synchronously), so this can't cascade renders.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount
    void refresh()
  }, [refresh])

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

  async function onSignOut() {
    await signOut()
    router.replace("/login")
  }

  return (
    <main>
      <DashboardTabs
        tab={tab}
        onTabChange={setTab}
        email={email}
        onSignOut={onSignOut}
      />

      {tab === "connection" && <ConnectionPanel />}

      {tab === "keys" && (
        <KeysPanel
          keys={keys}
          loading={loading}
          error={creating ? null : error}
          onCreate={openCreate}
          onRevoke={onRevoke}
        />
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
    </main>
  )
}
