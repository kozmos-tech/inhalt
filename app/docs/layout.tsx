import { DocsHeader } from "./_components/docs-header"
import { DocsSidebar } from "./_components/docs-sidebar"
import "./docs.css"

// Shared chrome for every docs page: top bar, left-hand nav, and a centered
// content column. Individual pages render their prose into `children`.
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs">
      <DocsHeader />
      <div className="docs-shell">
        <aside className="docs-aside">
          <DocsSidebar />
        </aside>
        {children}
      </div>
    </div>
  )
}
