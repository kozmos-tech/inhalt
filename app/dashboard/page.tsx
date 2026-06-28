"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { CopyButton } from "../components/copy-button"
import {
  CheckIcon,
  KeyIcon,
  LogOutIcon,
  PlugIcon,
  PlusIcon,
  TerminalIcon,
  TrashIcon,
} from "../components/icons"
import { Wordmark } from "../components/wordmark"
import {
  createKey,
  listKeys,
  revokeKey,
  type ApiKey,
} from "../lib/keys-client"
import { signOut, useSession } from "../lib/auth-client"
import { eyebrow, ghostButton, input, primaryButton } from "../lib/ui"

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

const SECTIONS = [
  { id: "connection", index: "01", label: "Connection", icon: PlugIcon },
  { id: "keys", index: "02", label: "API keys", icon: KeyIcon },
] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function initials(email: string) {
  const name = email.split("@")[0] ?? ""
  return (name.slice(0, 2) || "in").toUpperCase()
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [active, setActive] = useState<string>("connection")
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [revealed, setRevealed] = useState<ApiKey | null>(null)

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

  // Scroll-spy: highlight the nav item for whichever section is in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] },
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return

    setBusy(true)
    setError(null)
    try {
      const created = await createKey(newName)
      setRevealed(created)
      setNewName("")
      setCreating(false)
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
    <div className="flex min-h-full flex-1">
      {/* sidebar (desktop) */}
      <aside className="hairline sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r md:flex">
        <div className="hairline flex h-14 items-center border-b px-5">
          <Wordmark href="/dashboard" />
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {SECTIONS.map((s) => {
            const isActive = active === s.id
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={
                  "group relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition " +
                  (isActive
                    ? "bg-white/[0.06] text-zinc-100"
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200")
                }
              >
                <span
                  className={
                    "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-zinc-50 transition-opacity " +
                    (isActive ? "opacity-100" : "opacity-0")
                  }
                />
                <Icon
                  size={15}
                  className={isActive ? "text-zinc-200" : "text-zinc-500 group-hover:text-zinc-300"}
                />
                <span className="font-medium">{s.label}</span>
                <span className="ml-auto font-mono text-[10px] tracking-wider text-zinc-600">
                  {s.index}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="hairline border-t p-3">
          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-zinc-50 text-[11px] font-semibold text-zinc-950">
              {initials(email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-zinc-200">
                {email}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                Workspace
              </p>
            </div>
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
            >
              <LogOutIcon size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <header className="hairline sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-[#08080a]/80 px-5 backdrop-blur-md md:hidden">
          <Wordmark href="/dashboard" />
          <button onClick={onSignOut} className={ghostButton + " h-9 px-3 text-[13px]"}>
            <LogOutIcon size={15} />
            Sign out
          </button>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:px-10 md:py-14">
          {/* page header */}
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Workspace</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
                Dashboard
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                Connect a client and manage the keys that authenticate it.
              </p>
            </div>
          </div>

          {/* mobile section nav */}
          <div className="hairline mb-8 flex gap-1 rounded-lg border bg-white/[0.02] p-1 md:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition " +
                  (active === s.id
                    ? "bg-white/[0.07] text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-200")
                }
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-14">
            <Connection />
            <Keys
              keys={keys}
              loading={loading}
              busy={busy}
              error={error}
              creating={creating}
              setCreating={setCreating}
              newName={newName}
              setNewName={setNewName}
              revealed={revealed}
              setRevealed={setRevealed}
              onCreate={onCreate}
              onRevoke={onRevoke}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function SectionHeading({
  index,
  title,
  action,
}: {
  index: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-[11px] font-medium tracking-[0.16em] text-zinc-600">
          {index}
        </span>
        <span className="h-3 w-px bg-white/10" />
        <h2 className={eyebrow}>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Tick({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={"pointer-events-none absolute h-2 w-2 text-zinc-700 " + className}
    >
      <svg viewBox="0 0 8 8" fill="none" className="h-full w-full">
        <path d="M4 0v8M0 4h8" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  )
}

function Connection() {
  return (
    <section id="connection" className="scroll-mt-20">
      <SectionHeading index="01" title="Connection" />

      <div className="space-y-4">
        {/* endpoint readout */}
        <div className="panel rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">MCP endpoint</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Point any MCP client here, then authenticate with a key.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping-mono absolute inline-flex h-full w-full rounded-full bg-zinc-300" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-200" />
              </span>
              Live
            </span>
          </div>

          <div className="relative mt-4">
            <div className="code-panel flex items-center justify-between gap-3 rounded-lg py-2 pl-3.5 pr-2">
              <code className="truncate font-mono text-sm text-zinc-200">
                {ENDPOINT}
              </code>
              <CopyButton value={ENDPOINT} label="Copy" />
            </div>
            <Tick className="-left-1 -top-1" />
            <Tick className="-right-1 -top-1" />
            <Tick className="-bottom-1 -left-1" />
            <Tick className="-bottom-1 -right-1" />
          </div>
        </div>

        {/* client config */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <TerminalIcon size={15} className="text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Client configuration
            </h3>
          </div>
          <div className="code-panel overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </span>
                <span className="ml-1 font-mono text-xs text-zinc-500">
                  mcp.json
                </span>
              </div>
              <CopyButton
                value={CONFIG}
                label="Copy"
                className="text-zinc-400 hover:bg-white/10 hover:text-white"
              />
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-zinc-300">
              {CONFIG}
            </pre>
          </div>
          <p className="px-1 text-xs text-zinc-500">
            Replace{" "}
            <code className="font-mono text-zinc-300">YOUR_KEY</code> with a key
            from below.
          </p>
        </div>
      </div>
    </section>
  )
}

type KeysProps = {
  keys: ApiKey[]
  loading: boolean
  busy: boolean
  error: string | null
  creating: boolean
  setCreating: (v: boolean) => void
  newName: string
  setNewName: (v: string) => void
  revealed: ApiKey | null
  setRevealed: (v: ApiKey | null) => void
  onCreate: (e: React.FormEvent) => void
  onRevoke: (id: string) => void
}

function Keys({
  keys,
  loading,
  busy,
  error,
  creating,
  setCreating,
  newName,
  setNewName,
  revealed,
  setRevealed,
  onCreate,
  onRevoke,
}: KeysProps) {
  return (
    <section id="keys" className="scroll-mt-20">
      <SectionHeading
        index="02"
        title="API keys"
        action={
          !creating && (
            <button
              onClick={() => setCreating(true)}
              className={primaryButton + " h-9 px-3"}
            >
              <PlusIcon size={15} />
              New key
            </button>
          )
        }
      />

      <div className="space-y-4">
        {/* reveal-once */}
        {revealed?.secret && (
          <div className="panel rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-zinc-100">
                <CheckIcon size={12} />
              </span>
              <p className="text-sm font-medium text-zinc-100">Key created</p>
            </div>
            <p className="mt-1 pl-7 text-xs text-zinc-500">
              Copy it now. For security, it will not be shown again.
            </p>
            <div className="code-panel mt-3 flex items-center gap-2 rounded-lg py-2 pl-3 pr-2">
              <code className="flex-1 truncate font-mono text-sm text-zinc-100">
                {revealed.secret}
              </code>
              <CopyButton
                value={revealed.secret}
                label="Copy"
                className="text-zinc-400 hover:bg-white/10 hover:text-white"
              />
            </div>
            <button
              onClick={() => setRevealed(null)}
              className="mt-3 text-xs font-medium text-zinc-500 underline-offset-4 transition hover:text-zinc-100 hover:underline"
            >
              I have saved my key
            </button>
          </div>
        )}

        {/* create form */}
        {creating && (
          <form
            onSubmit={onCreate}
            className="panel flex items-center gap-2 rounded-2xl p-2.5"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Key name, e.g. Production or Claude Desktop"
              className={input}
            />
            <button
              type="submit"
              disabled={busy}
              className={primaryButton + " shrink-0 disabled:opacity-60"}
            >
              {busy ? "…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false)
                setNewName("")
              }}
              className={ghostButton + " shrink-0"}
            >
              Cancel
            </button>
          </form>
        )}

        {error && (
          <p className="text-[13px] text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* list */}
        <div className="panel overflow-hidden rounded-2xl">
          <div className="hairline flex items-center justify-between gap-3 border-b px-5 py-3.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {loading
                ? "Loading…"
                : `${keys.length} ${keys.length === 1 ? "key" : "keys"} active`}
            </p>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-zinc-500">
              Loading keys…
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-500">
                <KeyIcon size={18} />
              </span>
              <p className="mt-3.5 text-sm font-medium text-zinc-100">
                No keys yet
              </p>
              <p className="mt-1 max-w-xs text-sm text-zinc-500">
                Create a key to connect your first MCP client to Inhalt.
              </p>
              {!creating && (
                <button
                  onClick={() => setCreating(true)}
                  className={primaryButton + " mt-5 h-9 px-3.5"}
                >
                  <PlusIcon size={15} />
                  Create a key
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {keys.map((key) => (
                <li
                  key={key.id}
                  className="group flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400">
                      <KeyIcon size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {key.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                        <code className="font-mono">
                          {key.prefix}
                          <span className="tracking-tight text-zinc-600">
                            ••••••••
                          </span>
                        </code>
                        <span className="text-zinc-700">·</span>
                        <span>Created {formatDate(key.createdAt)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRevoke(key.id)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-500 opacity-0 transition hover:bg-white/[0.06] hover:text-zinc-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-white/15 group-hover:opacity-100"
                  >
                    <TrashIcon size={13} />
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
