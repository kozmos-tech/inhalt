"use client"

import { createContext, use, useState } from "react"
import type { DashboardTab } from "../utils/types"

// Holds the one piece of cross-component client state on the dashboard: which
// tab is active. It's a thin client island so the page itself stays a Server
// Component - it just wraps the server-composed tree, and the tabs/panels reach
// in for the active tab via use(DashboardContext). Fetching (e.g. the keys
// query) stays deep in the server tree, never hoisted up here.
type DashboardContextValue = {
  tab: DashboardTab
  setTab: (tab: DashboardTab) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<DashboardTab>("connection")
  return <DashboardContext value={{ tab, setTab }}>{children}</DashboardContext>
}

export function useDashboardTab(): DashboardContextValue {
  const ctx = use(DashboardContext)
  if (!ctx) throw new Error("useDashboardTab must be used within a DashboardProvider")
  return ctx
}
