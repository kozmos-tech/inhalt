import Link from "next/link"
import Image from "next/image"
import { GetStartedButton } from "./get-started-button"

// Sticky top bar: wordmark, in-page nav, and sign-in / get-started actions.
export function LandingHeader() {
  return (
    <header className="lp-header">
      <div className="lp-shell lp-header-inner">
        <a href="/#top" className="lp-wordmark" aria-label="Inhalt">
          <span className="lp-mark" aria-hidden>
            <Image src="/icon.png" alt="" width={26} height={26} />
          </span>
          Inhalt
        </a>
        <nav className="lp-nav">
          <Link href="/docs">Docs</Link>
          <Link href="/letter" className="lp-nav-letter">
            Our letter
          </Link>
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
