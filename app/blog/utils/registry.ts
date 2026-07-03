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
  kind: "alternatives" | "comparison" // shapes the short tag/label: "X alternatives" vs "Inhalt vs X"
  date: string // ISO date, used for ordering and display
}

// The short label used in the blog list and footer, derived from the post kind.
export function postLabel(post: PostMeta): string {
  return post.kind === "comparison" ? `Inhalt vs ${post.competitor}` : `${post.competitor} alternatives`
}

export const POSTS: PostMeta[] = [
  {
    slug: "contentful-alternatives",
    competitor: "Contentful",
    kind: "alternatives",
    file: "contentful-alternatives.md",
    title: "7 Contentful Alternatives Worth a Look",
    description: "Open source and headless options to move to when Contentful's pricing or admin app starts to weigh on you.",
    date: "2026-06-12",
  },
  {
    slug: "sanity-alternatives",
    competitor: "Sanity",
    kind: "alternatives",
    file: "sanity-alternatives.md",
    title: "Sanity Alternatives for Teams Who Don't Want to Build a Studio",
    description: "Where to go when you love the Sanity model but not the work of building and running the editing app.",
    date: "2026-06-18",
  },
  {
    slug: "strapi-alternatives",
    competitor: "Strapi",
    kind: "alternatives",
    file: "strapi-alternatives.md",
    title: "Strapi Alternatives for Developers",
    description: "Self hosted and open source CMS options to consider when Strapi's upkeep or admin app is more than you need.",
    date: "2026-06-23",
  },
  {
    slug: "wordpress-alternatives",
    competitor: "WordPress",
    kind: "alternatives",
    file: "wordpress-alternatives.md",
    title: "WordPress Alternatives for Teams Done With the Dashboard",
    description: "Leaner ways to manage content once the WordPress admin, plugins, and updates become a job of their own.",
    date: "2026-06-26",
  },
  {
    slug: "storyblok-alternatives",
    competitor: "Storyblok",
    kind: "alternatives",
    file: "storyblok-alternatives.md",
    title: "Storyblok Alternatives: Beyond the Visual Editor",
    description: "Options for teams who want typed, structured content instead of a visual page builder.",
    date: "2026-06-29",
  },
  {
    slug: "ghost-alternatives",
    competitor: "Ghost",
    kind: "alternatives",
    file: "ghost-alternatives.md",
    title: "Ghost Alternatives for Sites That Outgrew the Blog",
    description: "Where to look when you need more content types and a real API than Ghost was built to give.",
    date: "2026-07-01",
  },
  {
    slug: "inhalt-vs-contentful",
    competitor: "Contentful",
    kind: "comparison",
    file: "inhalt-vs-contentful.md",
    title: "Inhalt vs Contentful: Dashboard or No Dashboard",
    description: "Both give you typed content and a clean API. The split is the editing app: Contentful hands you one, Inhalt has none.",
    date: "2026-07-03",
  },
  {
    slug: "inhalt-vs-sanity",
    competitor: "Sanity",
    kind: "comparison",
    file: "inhalt-vs-sanity.md",
    title: "Inhalt vs Sanity: Build a Studio or Skip It",
    description: "Sanity asks you to build and run the editing app. Inhalt drops it and edits through the client you already use.",
    date: "2026-07-02",
  },
  {
    slug: "inhalt-vs-strapi",
    competitor: "Strapi",
    kind: "comparison",
    file: "inhalt-vs-strapi.md",
    title: "Inhalt vs Strapi: Self Hosted, With or Without the Admin App",
    description: "Both are open source and self hosted with no seat bill. Strapi ships an admin app to run, Inhalt has none.",
    date: "2026-06-30",
  },
  {
    slug: "inhalt-vs-wordpress",
    competitor: "WordPress",
    kind: "comparison",
    file: "inhalt-vs-wordpress.md",
    title: "Inhalt vs WordPress: Beyond the Dashboard",
    description: "WordPress lives in its admin panel and plugins. Inhalt has no dashboard and feeds any front end through a clean API.",
    date: "2026-06-24",
  },
  {
    slug: "inhalt-vs-storyblok",
    competitor: "Storyblok",
    kind: "comparison",
    file: "inhalt-vs-storyblok.md",
    title: "Inhalt vs Storyblok: Visual Canvas or Typed Fields",
    description: "Storyblok is built around a visual page builder. Inhalt drops the canvas for strict typed content edited by chatting.",
    date: "2026-06-20",
  },
]

export function postBySlug(slug: string): PostMeta | undefined {
  return POSTS.find((p) => p.slug === slug)
}
