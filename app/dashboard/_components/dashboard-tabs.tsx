"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
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
        <Button
          role="tab"
          aria-selected={tab === "connection"}
          onClick={() => setTab("connection")}
        >
          Connection
        </Button>
        <Button
          role="tab"
          aria-selected={tab === "keys"}
          onClick={() => setTab("keys")}
        >
          API keys
        </Button>
      </div>
      <div className="user">
        <span>{email}</span>
        <Button onClick={onSignOut}>Sign out</Button>
      </div>
    </div>
  )
}
