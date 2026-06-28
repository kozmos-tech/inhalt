import { ArrowRightIcon, GithubIcon } from "@/components/ui/icons"
import { GITHUB_URL } from "../utils/constants"
import { GetStartedButton } from "./get-started-button"

// MIT-licensed closing section with source and get-started CTAs.
export function OpenSourceSection() {
  return (
    <section className="lp-section lp-divide" id="open">
      <div className="lp-shell">
        <div className="lp-measure-wide">
          <p className="lp-eyebrow">MIT licensed</p>
          <h2 className="lp-h2-lg">Your content. Your keys. Your call.</h2>
          <p className="lp-body lp-measure">
            Inhalt is open source, end to end. Read the code, self-host the whole
            thing on a single container, or use the hosted edge. No vendor
            lock-in.
          </p>
          <div className="lp-cta-row">
            <a href={GITHUB_URL} className="lp-btn lp-btn-outline lp-btn-lg">
              <GithubIcon size={16} />
              Read the source
            </a>
            <GetStartedButton className="lp-btn lp-btn-primary lp-btn-lg">
              Get started
              <ArrowRightIcon size={16} />
            </GetStartedButton>
          </div>
        </div>
      </div>
    </section>
  )
}
