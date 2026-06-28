// Route guard (this Next build renames "middleware" to "proxy").
//
// An optimistic, cookie-only check: it never touches the database, so it stays
// fast on every navigation. It only decides redirects - the authoritative check
// happens at the data source via requireSession() (app/lib/session.ts). Logged-in
// users are bounced away from the auth pages; anonymous users are bounced to
// /login when they reach the dashboard.

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const AUTH_PAGES = ["/login", "/signup"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(getSessionCookie(request))

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Run on app routes only - skip API (handled server-side), Next internals, and
// static assets so they aren't blocked by the redirects above.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
