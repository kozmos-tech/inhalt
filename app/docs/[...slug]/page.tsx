import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DOCS, docBySlug } from "../utils/registry"
import { renderDoc } from "../utils/render"

// Only the slugs in the registry are valid; anything else 404s.
export const dynamicParams = false

export function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug.split("/") }))
}

type DocPageProps = { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = docBySlug(slug.join("/"))
  if (!doc) return {}
  return { title: `${doc.title} — Inhalt docs` }
}

// Renders a single public doc by reading its Markdown file and emitting the
// rendered HTML. The content is our own trusted Markdown from the repo.
export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  const doc = docBySlug(slug.join("/"))
  if (!doc) notFound()

  const html = await renderDoc(doc.file)

  return (
    <main className="docs-main">
      <article className="docs-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
