import type { MetadataRoute } from "next"
import { SITE_URL } from "@/app/utils/constants"
import { POSTS } from "@/app/blog/utils/registry"
import { DOCS } from "@/app/docs/utils/registry"

// A single sitemap for the public marketing/content surface. Private routes
// (dashboard, auth) and API endpoints (mcp, .well-known) are intentionally left
// out — search engines have no business indexing them.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/letter`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/docs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]

  const docPages: MetadataRoute.Sitemap = DOCS.map((doc) => ({
    url: `${SITE_URL}/docs/${doc.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const blogPages: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticPages, ...docPages, ...blogPages]
}
