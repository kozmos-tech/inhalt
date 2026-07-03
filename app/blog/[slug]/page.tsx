import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRightIcon } from "@/components/ui/icons"
import { POSTS, postBySlug } from "../utils/registry"
import { renderPost } from "../utils/render"

// Only the slugs in the registry are valid; anything else 404s.
export const dynamicParams = false

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }))
}

type PostPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) return {}
  return { title: `${post.title} — Inhalt`, description: post.description }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

// Renders a single post by reading its Markdown file and emitting the rendered
// HTML. The content is our own trusted Markdown from the repo.
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) notFound()

  const { html, toc, readingMinutes } = await renderPost(post.file)

  return (
    <article className="blog-post">
      <div className="lp-shell">
        <header className="blog-post-head">
          <Link href="/blog" className="blog-breadcrumb">
            <ArrowRightIcon size={13} />
            All posts
          </Link>
          <p className="lp-eyebrow">Comparison</p>
          <h1 className="blog-post-title">{post.title}</h1>
          <p className="blog-lede">{post.description}</p>
          <div className="blog-post-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{readingMinutes} min read</span>
          </div>
        </header>

        <div className="blog-post-body">
          {toc.length > 0 && (
            <aside className="blog-toc" aria-label="On this page">
              <p className="blog-toc-title">On this page</p>
              <nav>
                <ul>
                  {toc.map((entry) => (
                    <li key={entry.id} className={`blog-toc-l${entry.level}`}>
                      <a href={`#${entry.id}`}>{entry.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}

          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        <footer className="blog-post-foot">
          <p className="blog-post-foot-lead">The CMS your AI tools can run.</p>
          <p className="blog-post-foot-sub">
            Inhalt is open source and exposes your content through the Model Context Protocol, so the client you
            already use becomes the way you manage it.
          </p>
          <div className="blog-post-foot-actions">
            <Link href="/docs/getting-started" className="lp-btn lp-btn-primary lp-btn-sm">
              Get started
            </Link>
            <Link href="/blog" className="lp-quiet-link">
              Read more posts
            </Link>
          </div>
        </footer>
      </div>
    </article>
  )
}
