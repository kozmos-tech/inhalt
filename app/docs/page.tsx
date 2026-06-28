import type { Metadata } from "next"
import Link from "next/link"
import { DOCS } from "./utils/registry"

export const metadata: Metadata = {
  title: "Documentation — Inhalt",
  description: "Connect an MCP client to Inhalt and operate on your content. Guides and API reference.",
}

// Short summaries shown on the docs landing, one per public doc.
const SUMMARIES: Record<string, string> = {
  "getting-started": "Connect an MCP client and start operating on content.",
  concepts: "Projects, content types, entries, and the draft and publish model.",
  api: "The two surfaces you talk to from outside the dashboard.",
  "api/read": "The public HTTP API that serves your published content.",
  "api/mcp": "The typed tool surface your AI client uses to edit content.",
}

export default function DocsIndex() {
  return (
    <main className="docs-main">
      <article className="docs-prose">
        <h1>Documentation</h1>
        <p>
          Inhalt is an open-source, MCP-native CMS. The content layer is exposed through the Model
          Context Protocol, so any MCP client can read and edit your content directly. The protocol
          is the API. There is no SDK.
        </p>

        <div className="docs-cards">
          {DOCS.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className="docs-card">
              <span className="docs-card-title">{doc.title}</span>
              <span className="docs-card-desc">{SUMMARIES[doc.slug]}</span>
            </Link>
          ))}
        </div>
      </article>
    </main>
  )
}
