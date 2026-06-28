import Link from "next/link"
import { GetStartedButton } from "./get-started-button"

// Sticky top bar: wordmark, in-page nav, and sign-in / get-started actions.
export function LandingHeader() {
  return (
    <header className="lp-header">
      <div className="lp-shell lp-header-inner">
        <a href="#top" className="lp-wordmark" aria-label="Inhalt">
          <span className="lp-mark" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2.5" y="3" width="9" height="1.6" rx="0.8" fill="currentColor" />
              <rect x="2.5" y="6.2" width="9" height="1.6" rx="0.8" fill="currentColor" fillOpacity="0.5" />
              <rect x="2.5" y="9.4" width="5.5" height="1.6" rx="0.8" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </span>
          Inhalt
        </a>
        <nav className="lp-nav">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#open">Open source</a>
          <Link href="/docs">Docs</Link>
        </nav>
        <div className="lp-header-actions">
          <Link href="/login" className="lp-quiet-link">
            Sign in
          </Link>
          <GetStartedButton className="lp-btn lp-btn-primary lp-btn-sm">
            Get started
          </GetStartedButton>
        </div>
      </div>
    </header>
  )
}
