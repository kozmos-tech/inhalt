"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { setUser } from "../lib/store"
import { eyebrow, input, label, primaryButton } from "../lib/ui"

type Mode = "signin" | "signup"

const copy = {
  signin: {
    eyebrow: "Access",
    title: "Sign in to Inhalt",
    subtitle: "Welcome back. Connect your content layer.",
    action: "Sign in",
    passwordHint: "current-password",
    passwordPlaceholder: "Your password",
    footer: "New to Inhalt?",
    footerLink: "Create an account",
    footerHref: "/signup",
  },
  signup: {
    eyebrow: "Get started",
    title: "Create your account",
    subtitle: "Stand up a content layer your AI tools can run.",
    action: "Create account",
    passwordHint: "new-password",
    passwordPlaceholder: "At least 8 characters",
    footer: "Already have an account?",
    footerLink: "Sign in",
    footerHref: "/login",
  },
} satisfies Record<Mode, unknown>

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const t = copy[mode]

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setUser(email)
    router.push("/dashboard")
  }

  return (
    <div>
      <div className="panel relative overflow-hidden rounded-2xl p-8">
        {/* top hairline accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="mb-6">
          <p className={eyebrow}>{t.eyebrow}</p>
          <h1 className="mt-2.5 text-lg font-semibold tracking-tight text-zinc-50">
            {t.title}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">{t.subtitle}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className={label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={label}>
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  className="text-[13px] font-medium text-zinc-500 transition hover:text-zinc-200"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              autoComplete={t.passwordHint}
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </div>

          <button type="submit" className={primaryButton + " mt-1 w-full"}>
            {t.action}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t.footer}{" "}
        <Link
          href={t.footerHref}
          className="font-medium text-zinc-200 underline-offset-4 transition hover:text-white hover:underline"
        >
          {t.footerLink}
        </Link>
      </p>
    </div>
  )
}
