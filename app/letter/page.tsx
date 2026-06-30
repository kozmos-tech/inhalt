import type { Metadata } from "next"
import { LandingFooter } from "../_components/landing-footer"
import { LandingHeader } from "../_components/landing-header"
import "../landing.css"

export const metadata: Metadata = {
}

export default function LetterPage() {
  const year = new Date().getFullYear()

  return (
    <div className="lp" id="top">
      <LandingHeader />
      <main>
        <article className="lp-section lp-letter">
          <div className="lp-shell">
            <div className="lp-measure-wide">
              <p className="lp-eyebrow">A letter of intent</p>
              <h1 className="lp-h2-lg">Why we are building Inhalt</h1>

              <div className="lp-letter-body">
                <p>
                  Managing content has always meant leaving the tool you were
                  already working in, signing into an admin panel, and hunting
                  for the right field to change. The work was simple, but
                  getting to it never was.
                </p>
                <p>
                  We think that step should disappear. Your AI tools already
                  understand what you want to say, so they should be able to
                  read your content, find the right entry, and make the change
                  for you. Inhalt makes that possible by exposing the whole
                  content layer through the Model Context Protocol, so the
                  client you already use becomes the way you manage content.
                </p>
                <p>
                  Nothing about your content gets sloppy in the process. Every
                  change is checked against your schema and written to real,
                  typed fields, never freeform text. You stage edits, review
                  them, and publish only when they are ready.
                </p>
                <p>
                  It is open source and yours to run. One container, your
                  database, your keys, and a hosted edge when you would rather
                  not think about any of that. We are building Inhalt because
                  this is the CMS we wanted to use, and we hope it becomes the
                  one you reach for too.
                </p>
              </div>

              <div className="lp-letter-sign">
                <p>Meduard Krasniqi</p>
                <a
                  className="lp-letter-sign-link"
                  href="https://www.linkedin.com/in/meduardkrasniqi/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/meduardkrasniqi
                </a>
              </div>
            </div>
          </div>
        </article>
      </main>
      <LandingFooter year={year} />
    </div>
  )
}
