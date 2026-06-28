// The public documentation surface. Each entry points at a real Markdown file
// under `docs/` (rendered as-is) and is keyed by the URL slug it lives at under
// `/docs`. Only user-facing docs are listed here; contributor docs (development,
// code-organization, copy-style, roadmap) stay out of the public route.
//
// Pure data only (no node imports) so client components like the sidebar can
// import it safely.
export type DocMeta = {
  slug: string // URL path under /docs, e.g. "api/read"
  file: string // path relative to the repo's docs/ folder
  title: string // sidebar + page title
  group: string // sidebar grouping
}

export const DOCS: DocMeta[] = [
  { slug: "getting-started", file: "getting-started.md", title: "Getting started", group: "Guides" },
  { slug: "concepts", file: "concepts.md", title: "Concepts", group: "Guides" },
  { slug: "api", file: "api/README.md", title: "API reference", group: "API" },
  { slug: "api/read", file: "api/read.md", title: "Read API", group: "API" },
  { slug: "api/mcp", file: "api/mcp.md", title: "MCP API", group: "API" },
]

export function docBySlug(slug: string): DocMeta | undefined {
  return DOCS.find((d) => d.slug === slug)
}
