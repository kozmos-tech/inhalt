// Shown by Suspense while the dashboard page resolves the session and loads the
// project's keys on the server. Mirrors the real layout's tabbar so the shell is
// stable and only the content area swaps in once the data arrives.
export default function DashboardLoading() {
  return (
    <main>
      <div className="tabbar">
        <div role="tablist" aria-label="Dashboard sections">
          <button role="tab" aria-selected="true" disabled>
            Connection
          </button>
          <button role="tab" aria-selected="false" disabled>
            API keys
          </button>
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
