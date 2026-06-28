"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth/client"
import { useDashboardTab } from "./dashboard-context"

type DashboardTabsProps = {
  email: string
}

export function DashboardTabs({ email }: DashboardTabsProps) {
  const router = useRouter()
  const { tab, setTab } = useDashboardTab()

  async function onSignOut() {
    await signOut()
    router.replace("/login")
  }

  return (
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
  )
}
