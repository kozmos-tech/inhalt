import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon } from "@/components/ui/icons"
import { POSTS } from "./utils/registry"
import { readingMinutes } from "./utils/render"

export const metadata: Metadata = {
  title: "Blog — Inhalt",
  description:
    "Comparisons and guides on headless and open-source content management, and where an MCP-native CMS fits.",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default async function BlogIndex() {
  // Newest first, with a reading-time estimate for each.
  const ordered = [...POSTS].sort((a, b) => b.date.localeCompare(a.date))
  const posts = await Promise.all(
    ordered.map(async (post) => ({ ...post, minutes: await readingMinutes(post.file) })),
  )

  return (
    <div className="blog-index">
      <div className="lp-shell">
        <header className="blog-index-head">
          <p className="lp-eyebrow">Blog</p>
          <h1 className="blog-index-title">Comparisons and writing on content</h1>
          <p className="blog-lede">
            Plain, side-by-side looks at the CMS tools teams actually use, and an honest read on where Inhalt fits.
          </p>
        </header>

        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.slug} className="blog-list-item">
              <Link href={`/blog/${post.slug}`} className="blog-list-link">
                <div className="blog-list-main">
                  <span className="blog-list-tag">{post.competitor} alternatives</span>
                  <span className="blog-list-title">{post.title}</span>
                  <span className="blog-list-desc">{post.description}</span>
                  <span className="blog-list-meta">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{post.minutes} min read</span>
                  </span>
                </div>
                <span className="blog-list-arrow" aria-hidden>
                  <ArrowRightIcon size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
