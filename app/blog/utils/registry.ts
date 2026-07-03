// The public blog surface. Each entry points at a real Markdown file under
// `blog/` (rendered as-is) and is keyed by the URL slug it lives at under
// `/blog`. The `title` doubles as the on-page H1 and the SEO title; `description`
// is both the page dek and the meta description.
//
// Pure data only (no node imports) so client components like the footer can
// import it safely.
export type PostMeta = {
  slug: string // URL path under /blog, e.g. "contentful-alternatives"
  file: string // path relative to the repo's blog/ folder
  title: string // on-page heading + SEO title
  description: string // dek shown under the title + meta description
  competitor: string // the CMS the post compares against, used for short footer labels
  date: string // ISO date, used for ordering and display
}

export const POSTS: PostMeta[] = [
  {
    slug: "contentful-alternatives",
    competitor: "Contentful",
    file: "contentful-alternatives.md",
    title: "7 Contentful Alternatives Worth a Look",
    description: "Open source and headless options to move to when Contentful's pricing or admin app starts to weigh on you.",
    date: "2026-06-12",
  },
  {
    slug: "sanity-alternatives",
    competitor: "Sanity",
    file: "sanity-alternatives.md",
    title: "Sanity Alternatives for Teams Who Don't Want to Build a Studio",
    description: "Where to go when you love the Sanity model but not the work of building and running the editing app.",
    date: "2026-06-18",
  },
  {
    slug: "strapi-alternatives",
    competitor: "Strapi",
    file: "strapi-alternatives.md",
    title: "Strapi Alternatives for Developers",
    description: "Self hosted and open source CMS options to consider when Strapi's upkeep or admin app is more than you need.",
    date: "2026-06-23",
  },
  {
    slug: "wordpress-alternatives",
    competitor: "WordPress",
    file: "wordpress-alternatives.md",
    title: "WordPress Alternatives for Teams Done With the Dashboard",
    description: "Leaner ways to manage content once the WordPress admin, plugins, and updates become a job of their own.",
    date: "2026-06-26",
  },
  {
    slug: "storyblok-alternatives",
    competitor: "Storyblok",
    file: "storyblok-alternatives.md",
    title: "Storyblok Alternatives: Beyond the Visual Editor",
    description: "Options for teams who want typed, structured content instead of a visual page builder.",
    date: "2026-06-29",
  },
  {
    slug: "ghost-alternatives",
    competitor: "Ghost",
    file: "ghost-alternatives.md",
    title: "Ghost Alternatives for Sites That Outgrew the Blog",
    description: "Where to look when you need more content types and a real API than Ghost was built to give.",
    date: "2026-07-01",
  },
]

export function postBySlug(slug: string): PostMeta | undefined {
  return POSTS.find((p) => p.slug === slug)
}
