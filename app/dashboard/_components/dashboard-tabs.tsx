"use client"

import type { DashboardTab } from "../utils/types"

type DashboardTabsProps = {
  tab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  email: string
  onSignOut: () => void
}

export function DashboardTabs({ tab, onTabChange, email, onSignOut }: DashboardTabsProps) {
  return (
    <div className="tabbar">
      <div role="tablist" aria-label="Dashboard sections">
        <button
          role="tab"
          aria-selected={tab === "connection"}
          onClick={() => onTabChange("connection")}
        >
          Connection
        </button>
        <button
          role="tab"
          aria-selected={tab === "keys"}
          onClick={() => onTabChange("keys")}
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
