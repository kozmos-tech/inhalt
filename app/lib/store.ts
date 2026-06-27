// Client-side mock store for auth + API keys.
//
// There is no backend yet, so this persists to localStorage to make the flow
// real and demoable. It is exposed as a subscribable external store so React
// can read it via useSyncExternalStore (no hydration flash, no effects writing
// state). Swap these functions for API calls when the server lands; the call
// sites only depend on the signatures below.

export type ApiKey = {
  id: string
  name: string
  prefix: string
  createdAt: number
  // The full secret is only ever returned once, at creation time. It is never
  // stored in plaintext here and is never shown again.
  secret?: string
}

export type User = { email: string }

const USER_KEY = "inhalt.user"
const KEYS_KEY = "inhalt.keys"

const EMPTY_KEYS: ApiKey[] = []

// --- subscription ----------------------------------------------------------

const listeners = new Set<() => void>()

export function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback)
    }
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

// --- snapshots (cached so references stay stable between renders) -----------

let userCache: { raw: string | null; value: User | null } = {
  raw: null,
  value: null,
}

export function getUserSnapshot(): User | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (raw !== userCache.raw) {
    userCache = { raw, value: raw ? (JSON.parse(raw) as User) : null }
  }
  return userCache.value
}

export function getServerUserSnapshot(): User | null {
  return null
}

let keysCache: { raw: string | null; value: ApiKey[] } = {
  raw: null,
  value: EMPTY_KEYS,
}

export function getKeysSnapshot(): ApiKey[] {
  if (typeof window === "undefined") return EMPTY_KEYS
  const raw = window.localStorage.getItem(KEYS_KEY)
  if (raw !== keysCache.raw) {
    keysCache = { raw, value: raw ? (JSON.parse(raw) as ApiKey[]) : EMPTY_KEYS }
  }
  return keysCache.value
}

export function getServerKeysSnapshot(): ApiKey[] {
  return EMPTY_KEYS
}

// --- reads / mutations ------------------------------------------------------

export function getUser(): User | null {
  return getUserSnapshot()
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function setUser(email: string) {
  window.localStorage.setItem(USER_KEY, JSON.stringify({ email }))
  emit()
}

export function signOut() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(USER_KEY)
  emit()
}

export function createKey(name: string): ApiKey {
  const token = randomHex(24)
  const secret = `inh_live_${token}`
  const stored: ApiKey = {
    id: randomHex(6),
    name: name.trim() || "Untitled key",
    prefix: `inh_live_${token.slice(0, 4)}`,
    createdAt: Date.now(),
  }
  const next = [stored, ...getKeysSnapshot()]
  window.localStorage.setItem(KEYS_KEY, JSON.stringify(next))
  emit()
  return { ...stored, secret }
}

export function revokeKey(id: string) {
  const next = getKeysSnapshot().filter((key) => key.id !== id)
  window.localStorage.setItem(KEYS_KEY, JSON.stringify(next))
  emit()
}
