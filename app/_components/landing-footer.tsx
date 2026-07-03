import Link from "next/link"
import { ArrowUpRightIcon } from "@/components/ui/icons"
import { POSTS } from "../blog/utils/registry"

type LandingFooterProps = {
  year: number
}

// Footer: comparison links, product links, then the wordmark and license line.
export function LandingFooter({ year }: LandingFooterProps) {
  return (
    <footer className="lp-footer">
      <div className="lp-shell">
        <nav className="lp-footer-nav" aria-label="Footer">
          <div className="lp-footer-col">
            <span className="lp-footer-col-title">Compare</span>
            <div className="lp-footer-links-grid">
              {POSTS.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="lp-footer-link">
                  {post.competitor} alternatives
                </Link>
              ))}
            </div>
          </div>
          <div className="lp-footer-col">
            <span className="lp-footer-col-title">Product</span>
            <Link href="/docs" className="lp-footer-link">
              Docs
            </Link>
            <Link href="/blog" className="lp-footer-link">
              Blog
            </Link>
            <Link href="/letter" className="lp-footer-link">
              Our letter
            </Link>
          </div>
        </nav>

        <div className="lp-footer-inner">
          <span className="lp-footer-mark">Inhalt</span>
          <p className="lp-footer-meta">© {year} Based in Berlin</p>
          <a href="#top" className="lp-quiet-link lp-footer-top">
            Back to top
            <ArrowUpRightIcon size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
