"use client"

import { useState } from "react"

// Friendly labels for the OAuth scopes better-auth advertises. Anything we don't
// recognize falls back to its raw name so a new scope is still shown, not hidden.
const SCOPE_LABELS: Record<string, string> = {
  openid: "Confirm your identity",
  profile: "Read your basic profile",
  email: "Read your email address",
  offline_access: "Stay connected when you're away",
}

export function ConsentForm({
  consentCode,
  clientId,
  scope,
}: {
  consentCode: string
  clientId: string
  scope: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scopes = scope.split(" ").filter(Boolean)

  // Post the user's decision to the consent endpoint, which returns the URL to
  // send the client back to (carrying the auth code on approve, an error on deny).
  async function decide(accept: boolean) {
    if (pending) return
    setPending(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/oauth2/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accept, consent_code: consentCode }),
      })

      if (!res.ok) {
        setError("Could not record your choice. Please try connecting again.")
        setPending(false)
        return
      }

      const { redirectURI } = (await res.json()) as { redirectURI?: string }
      if (!redirectURI) {
        setError("The client did not provide a return address.")
        setPending(false)
        return
      }

      window.location.href = redirectURI
    } catch {
      setError("Something went wrong. Please try connecting again.")
      setPending(false)
    }
  }

  return (
    <div>
      <h2>Authorize access</h2>
      <p>
        An MCP client wants to connect to your Inhalt content. Approving lets it
        act on your behalf, the same as using the dashboard.
      </p>

      {scopes.length > 0 && (
        <ul>
          {scopes.map((s) => (
            <li key={s}>{SCOPE_LABELS[s] ?? s}</li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert">
          <strong>{error}</strong>
        </p>
      )}

      <p>
        <button type="button" onClick={() => decide(true)} disabled={pending || !consentCode}>
          {pending ? "…" : "Approve"}
        </button>{" "}
        <button type="button" onClick={() => decide(false)} disabled={pending || !consentCode}>
          Deny
        </button>
      </p>

      {!consentCode && (
        <p role="alert">
          <strong>This link is missing its consent code. Start the connection from your client again.</strong>
        </p>
      )}
    </div>
  )
}
