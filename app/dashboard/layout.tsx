import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "../lib/auth"

// Real auth gate for everything under /dashboard. proxy.ts does an optimistic
// cookie-only check for fast redirects, but it can't tell a valid session from a
// stale or forged cookie. This validates the session server-side on every render
// so a logged-out (or expired) visitor can never see a dashboard page - and since
// the data underneath is session-scoped (see lib/project.ts), they only ever get
// their own workspace.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  return <>{children}</>
}
