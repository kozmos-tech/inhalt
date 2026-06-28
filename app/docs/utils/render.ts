import { readFile } from "node:fs/promises"
import path from "node:path"
import { Marked } from "marked"
import { DOCS } from "./registry"

// Absolute path to the repo's docs/ folder, the source of truth we render from.
const DOCS_DIR = path.join(process.cwd(), "docs")

// Maps a docs-relative file path (e.g. "api/read.md") to the public URL it is
// served at, so in-document links between .md files can be rewritten to routes.
// A folder's README.md resolves to the folder itself (api/README.md -> /docs/api),
// and the root README.md resolves to the docs index (/docs).
const FILE_TO_SLUG = new Map<string, string>([
  ["README.md", ""],
  ...DOCS.map((d) => [d.file, d.slug] as const),
])

// Resolves a relative Markdown link found inside `fromFile` (docs-relative) to a
// public /docs URL, preserving any #hash. Returns null when the link points at a
// file that is not part of the public set, so the caller can leave it untouched.
function resolveDocHref(href: string, fromFile: string): string | null {
  if (/^[a-z]+:|^\/|^#/i.test(href)) return null // external, absolute, or bare hash

  const [rawPath, hash] = href.split("#")
  const targetFile = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), rawPath))

  const slug = FILE_TO_SLUG.get(targetFile)
  if (slug === undefined) return null

  const url = slug ? `/docs/${slug}` : "/docs"
  return hash ? `${url}#${hash}` : url
}

// Reads a docs Markdown file and renders it to HTML, rewriting links that point
// at other public docs (`concepts.md`, `api/read.md#hash`, ...) to their /docs
// routes so navigation stays inside the site. The Markdown itself is rendered
// verbatim, never rewritten.
export async function renderDoc(file: string): Promise<string> {
  const source = await readFile(path.join(DOCS_DIR, file), "utf8")

  const marked = new Marked({ gfm: true })
  marked.use({
    walkTokens(token) {
      if (token.type === "link") {
        const rewritten = resolveDocHref(token.href, file)
        if (rewritten) token.href = rewritten
      }
    },
  })

  return marked.parse(source, { async: false })
}
