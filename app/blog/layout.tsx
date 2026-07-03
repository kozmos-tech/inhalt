import { LandingFooter } from "../_components/landing-footer"
import { LandingHeader } from "../_components/landing-header"
import "../landing.css"
import "./blog.css"

// Shared chrome for the blog: the landing top bar and footer, with a centered
// reading column in between. Individual pages render into `children`.
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear()

  return (
    <div className="lp" id="top">
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter year={year} />
    </div>
  )
}
