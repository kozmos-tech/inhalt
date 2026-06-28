"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn, signUp } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

type Mode = "signin" | "signup"

const copy = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in to connect your content layer.",
    action: "Sign in",
    pendingAction: "Signing in",
    passwordHint: "current-password",
    footer: "New to Inhalt?",
    footerLink: "Create an account",
    footerHref: "/signup",
  },
  signup: {
    title: "Create your account",
    subtitle: "Stand up a content layer in one step.",
    action: "Create account",
    pendingAction: "Creating account",
    passwordHint: "new-password",
    footer: "Already have an account?",
    footerLink: "Sign in",
    footerHref: "/login",
  },
} satisfies Record<Mode, unknown>

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const t = copy[mode]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || pending) return

    setPending(true)
    setError(null)

    // Sign-up needs a display name; the email local-part is a sensible default.
    const result =
      mode === "signup"
        ? await signUp.email({ email, password, name: email.split("@")[0] || email })
        : await signIn.email({ email, password })

    setPending(false)

    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Please try again.")
      return
    }

    // If an MCP client sent us here mid OAuth flow (the authorize endpoint
    // bounces signed-out users to /login with the OAuth query intact), hand the
    // now-authenticated request back to it so it can issue the code. Otherwise
    // this is a normal sign-in: go to the dashboard.
    const params = new URLSearchParams(window.location.search)
    if (params.get("client_id") && params.get("redirect_uri")) {
      window.location.href = `/api/auth/mcp/authorize?${params.toString()}`
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="auth-card">
      <h2>{t.title}</h2>
      <p>{t.subtitle}</p>

      <form onSubmit={onSubmit} noValidate>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          required
          autoComplete={t.passwordHint}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? (
            <span className="btn-busy">
              <Spinner />
              {t.pendingAction}
            </span>
          ) : (
            t.action
          )}
        </Button>
      </form>

      <p className="auth-foot">
        {t.footer} <Link href={t.footerHref}>{t.footerLink}</Link>
      </p>
    </div>
  )
}


