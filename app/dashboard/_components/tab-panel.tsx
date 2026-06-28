"use client"

import { useDashboardTab } from "./dashboard-context"
import type { DashboardTab } from "../utils/types"

// A client wrapper that shows its (server-rendered) children only when its tab
// is active. Children are passed through untouched - ConnectionPanel and the
// streamed KeysSection render on the server and arrive here as already-rendered
// nodes. Using `hidden` rather than unmounting keeps the keys <Suspense>
// mounted so it streams in the background, ready by the time its tab is opened.
type TabPanelProps = {
  value: DashboardTab
  children: React.ReactNode
}

export function TabPanel({ value, children }: TabPanelProps) {
  const { tab } = useDashboardTab()
  return <div hidden={tab !== value}>{children}</div>
}
