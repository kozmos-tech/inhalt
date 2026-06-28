// Route guard (this Next build renames "middleware" to "proxy").
//
// An optimistic, cookie-only check: it never touches the database, so it stays
// fast on every navigation. It only decides redirects - the authoritative check
// happens at the data source via requireSession() (lib/auth/session.ts). Logged-in
// users are bounced away from the auth pages; anonymous users are bounced to
// /login when they reach the dashboard.

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const AUTH_PAGES = ["/login", "/signup"]

// The bare origin doubles as the MCP endpoint: an MCP client hitting "/" is
// routed to the /mcp handler, a browser falls through to the page. The published
// "/mcp" URL keeps working too - it reaches the handler directly, skipping this.
//
// We can't rely on the client advertising `Accept: text/event-stream`: not every
// MCP client sends it on the JSON-RPC POST (claude.ai's connector discovers auth
// via .well-known, then POSTs `initialize` without it), and a too-strict check
// routed that POST to the page route - a 405 the client reads as "no MCP server".
// So detect the client by what a browser never does at the site root: POST a body
// or open an event-stream. Server actions also POST to a page route, but they
// carry a Next-Action header and never target "/" (the homepage redirects away).
function isMcpRequest(request: NextRequest): boolean {
  if ((request.headers.get("accept") ?? "").includes("text/event-stream")) return true
  return request.method === "POST" && !request.headers.get("next-action")
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/" && isMcpRequest(request)) {
    return NextResponse.rewrite(new URL("/mcp", request.url))
  }

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
