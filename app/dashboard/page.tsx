"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  createKey,
  listKeys,
  revokeKey,
  type ApiKey,
} from "../lib/keys-client"
import { signOut, useSession } from "../lib/auth-client"

const ENDPOINT = "https://app.inhalt.tech/mcp"

const CONFIG = `{
  "mcpServers": {
    "inhalt": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}`

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

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
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<"connection" | "keys">("connection")

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

  async function copySecret() {
    if (!revealed?.secret) return
    try {
      await navigator.clipboard.writeText(revealed.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the key stays visible
      // for manual selection, so fail quietly.
    }
  }

  function openCreate() {
    setError(null)
    setNewName("")
    setCreating(true)
  }

  const [copiedField, setCopiedField] = useState<string | null>(null)
  async function copyField(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1500)
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail quietly.
    }
  }

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

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return

    setBusy(true)
    setError(null)
    try {
      const created = await createKey(newName)
      setCreating(false)
      setNewName("")
      setCopied(false)
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
      <div className="tabbar">
        <div role="tablist" aria-label="Dashboard sections">
          <button
            role="tab"
            aria-selected={tab === "connection"}
            onClick={() => setTab("connection")}
          >
            Connection
          </button>
          <button
            role="tab"
            aria-selected={tab === "keys"}
            onClick={() => setTab("keys")}
          >
            API keys
          </button>
        </div>
        <div className="user">
          <span>{email}</span>
          <button type="button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>

      {tab === "connection" && (
        <section>
          <p>
            Point any MCP client at this endpoint, then authenticate with a key
            from the API keys tab.
          </p>

          <h3>Endpoint</h3>
          <div className="copy-row">
            <code>{ENDPOINT}</code>
            <button
              type="button"
              onClick={() => copyField(ENDPOINT, "endpoint")}
            >
              {copiedField === "endpoint" ? "Copied" : "Copy"}
            </button>
          </div>

          <h3>Client configuration</h3>
          <div className="config-block">
            <div className="config-head">
              <span>mcp.json</span>
              <button
                type="button"
                onClick={() => copyField(CONFIG, "config")}
              >
                {copiedField === "config" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre>{CONFIG}</pre>
          </div>

          <p>
            Replace <code>YOUR_KEY</code> with a key from the API keys tab.
          </p>
        </section>
      )}

      {tab === "keys" && (
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

          {error && !creating && (
            <p role="alert">
              <strong>{error}</strong>
            </p>
          )}

          {loading ? (
            <p>Loading keys...</p>
          ) : keys.length === 0 ? (
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

          {/* Create flow */}
          <dialog ref={createRef} onClose={() => setCreating(false)}>
            <form onSubmit={onCreate}>
              <h2>Create API key</h2>
              <p>Give the key a name so you can recognize it later.</p>
              <label htmlFor="key-name">Name</label>
              <input
                id="key-name"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Production or Claude Desktop"
              />
              {error && (
                <p role="alert">
                  <strong>{error}</strong>
                </p>
              )}
              <div className="dialog-actions">
                <button type="button" onClick={() => setCreating(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={busy}>
                  {busy ? "Creating..." : "Create key"}
                </button>
              </div>
            </form>
          </dialog>

          {/* Reveal flow */}
          <dialog ref={revealRef} onClose={() => setRevealed(null)}>
            <h2>Your new API key</h2>
            <p>
              Copy this key now and store it somewhere safe. For security, it
              will not be shown again.
            </p>
            <div className="key-reveal">
              <code>{revealed?.secret}</code>
            </div>
            <div className="dialog-actions">
              <button type="button" className="primary" onClick={copySecret}>
                {copied ? "Copied" : "Copy key"}
              </button>
              <button type="button" onClick={() => setRevealed(null)}>
                Done
              </button>
            </div>
          </dialog>
        </section>
      )}
    </main>
  )
}
