// Shown by Suspense while the dashboard page resolves the session and loads the
// project's keys on the server. Mirrors the real layout's tabbar so the shell is
// stable and only the content area swaps in once the data arrives.
import { Button } from "@/components/ui/button"

export default function DashboardLoading() {
  return (
    <main>
      <div className="tabbar">
        <div role="tablist" aria-label="Dashboard sections">
          <Button role="tab" aria-selected="true" disabled>
            Connection
          </Button>
          <Button role="tab" aria-selected="false" disabled>
            API keys
          </Button>
        </div>
        <div className="user">
          <span aria-hidden>&nbsp;</span>
        </div>
      </div>

      <p className="empty" role="status">
        Loading...
      </p>
    </main>
  )
}
