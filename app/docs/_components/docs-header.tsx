import Link from "next/link"
import Image from "next/image"
import { GithubIcon } from "@/components/ui/icons"
import { GITHUB_URL } from "../../utils/constants"

// Sticky top bar for the docs route: wordmark back to the landing page, the
// source link, and a sign-in action. Mirrors the landing header's mark.
export function DocsHeader() {
  return (
    <header className="docs-header">
      <div className="docs-header-inner">
        <Link href="/" className="docs-wordmark" aria-label="Inhalt home">
          <span className="docs-mark" aria-hidden>
            <Image src="/icon.png" alt="" width={26} height={26} />
          </span>
          Inhalt
          <span className="docs-wordmark-sep" aria-hidden>
            /
          </span>
          <span className="docs-wordmark-section">Docs</span>
        </Link>
        <div className="docs-header-actions">
          <a href={GITHUB_URL} className="docs-quiet-link">
            <GithubIcon size={15} />
            GitHub
          </a>
          <Link href="/login" className="docs-quiet-link">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
