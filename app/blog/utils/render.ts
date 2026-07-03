import { readFile } from "node:fs/promises"
import path from "node:path"
import { Marked } from "marked"
import { POSTS } from "./registry"

// Absolute path to the repo's blog/ folder, the source of truth we render from.
const BLOG_DIR = path.join(process.cwd(), "blog")

// Maps a blog-relative file path (e.g. "sanity-alternatives.md") to the public
// URL it is served at, so links between posts can be rewritten to routes.
const FILE_TO_SLUG = new Map<string, string>(POSTS.map((p) => [p.file, p.slug] as const))

export type TocEntry = { id: string; text: string; level: 2 | 3 }

export type RenderedPost = {
  html: string
  toc: TocEntry[]
  readingMinutes: number
}

// Turns heading text into a stable, URL-safe anchor id.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

// Resolves a relative Markdown link found inside `fromFile` (blog-relative) to a
// public /blog URL, preserving any #hash. Returns null when the link points at a
// file that is not a known post, so the caller can leave it untouched (this keeps
// absolute links like /docs/getting-started alone).
function resolvePostHref(href: string, fromFile: string): string | null {
  if (/^[a-z]+:|^\/|^#/i.test(href)) return null // external, absolute, or bare hash

  const [rawPath, hash] = href.split("#")
  const targetFile = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), rawPath))

  const slug = FILE_TO_SLUG.get(targetFile)
  if (slug === undefined) return null

  const url = `/blog/${slug}`
  return hash ? `${url}#${hash}` : url
}

// Reads a blog Markdown file and renders it to HTML. Along the way it gives every
// h2/h3 a stable id and collects them into a table of contents, and rewrites
// links that point at other posts to their /blog routes so navigation stays
// inside the site.
export async function renderPost(file: string): Promise<RenderedPost> {
  const source = await readFile(path.join(BLOG_DIR, file), "utf8")

  const toc: TocEntry[] = []
  const seen = new Map<string, number>()

  const marked = new Marked({ gfm: true })
  marked.use({
    walkTokens(token) {
      if (token.type === "link") {
        const rewritten = resolvePostHref(token.href, file)
        if (rewritten) token.href = rewritten
      }
    },
    renderer: {
      heading(token) {
        const level = token.depth
        // parseInline keeps any inline markup (links, emphasis) in the heading.
        const inner = this.parser.parseInline(token.tokens)
        if (level !== 2 && level !== 3) {
          return `<h${level}>${inner}</h${level}>\n`
        }

        let id = slugify(token.text)
        const count = seen.get(id) ?? 0
        seen.set(id, count + 1)
        if (count) id = `${id}-${count}`

        toc.push({ id, text: token.text, level })
        return `<h${level} id="${id}">${inner}</h${level}>\n`
      },
    },
  })

  const html = marked.parse(source, { async: false })
  const words = source.split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(1, Math.round(words / 200))

  return { html, toc, readingMinutes }
}

// Lightweight reading-time estimate for the index, without rendering the post.
export async function readingMinutes(file: string): Promise<number> {
  const source = await readFile(path.join(BLOG_DIR, file), "utf8")
  const words = source.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
