import { Suspense } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { ConnectionPanel } from "./_components/connection-panel"
import { DashboardProvider } from "./_components/dashboard-context"
import { DashboardTabs } from "./_components/dashboard-tabs"
import { KeysSection } from "./_components/keys-section"
import { TabPanel } from "./_components/tab-panel"

// Server Component, and the composition root for the dashboard. layout.tsx has
// already validated the session, so here we resolve the viewer's email and lay
// out the tree on the server. DashboardProvider is the only client island at
// this level - it just carries the active-tab state; the tabs and panels reach
// in for it. The keys query stays deep in KeysSection under <Suspense>, so it
// streams in on its own and never blocks the shell or the Connection tab.
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const email = session?.user?.email ?? ""

  return (
    <DashboardProvider>
      <main>
        <DashboardTabs email={email} />

        <TabPanel value="connection">
          <ConnectionPanel />
        </TabPanel>

        <TabPanel value="keys">
          <Suspense fallback={<p className="empty">Loading keys...</p>}>
            <KeysSection />
          </Suspense>
        </TabPanel>
      </main>
    </DashboardProvider>
  )
}
