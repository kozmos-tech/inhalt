"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { DOCS } from "../utils/registry"

// Groups the public docs in registry order, preserving first-seen group order.
const GROUPS = DOCS.reduce<{ name: string; docs: typeof DOCS }[]>((acc, doc) => {
  const group = acc.find((g) => g.name === doc.group)
  if (group) group.docs.push(doc)
  else acc.push({ name: doc.group, docs: [doc] })
  return acc
}, [])

// Left-hand navigation for the docs route. Highlights the entry matching the
// current path so the reader always knows where they are.
export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="docs-nav" aria-label="Documentation">
      {GROUPS.map((group) => (
        <div key={group.name} className="docs-nav-group">
          <p className="docs-nav-heading">{group.name}</p>
          <ul>
            {group.docs.map((doc) => {
              const href = `/docs/${doc.slug}`
              return (
                <li key={doc.slug}>
                  <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                    {doc.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
