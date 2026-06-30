import { ArrowUpRightIcon } from "@/components/ui/icons"

type LandingFooterProps = {
  year: number
}

// Footer: wordmark, license line, and a back-to-top link.
export function LandingFooter({ year }: LandingFooterProps) {
  return (
    <footer className="lp-footer">
      <div className="lp-shell lp-footer-inner">
        <span className="lp-footer-mark">Inhalt</span>
        <p className="lp-footer-meta">
          © {year} Based in Berlin
        </p>
        <a href="#top" className="lp-quiet-link lp-footer-top">
          Back to top
          <ArrowUpRightIcon size={14} />
        </a>
      </div>
    </footer>
  )
}
