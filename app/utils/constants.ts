import {
  BoxesIcon,
  FileTextIcon,
  LockIcon,
  PlugIcon,
  TerminalIcon,
  ZapIcon,
} from "@/components/ui/icons"
import type { Feature, Step } from "./types"

export const GITHUB_URL = "https://github.com/kozmos-tech/inhalt"

// Public origin used to build absolute URLs (sitemap, metadata).
export const SITE_URL = "https://inhalt.tech"

// MCP clients we showcase in the "works with every MCP client" strip.
export const CLIENTS = ["Claude", "Cursor", "VS Code", "Zed", "Windsurf", "Cline"]

export const STEPS: Step[] = [
  {
    no: "01",
    title: "Connect the endpoint",
    body: "Add one block to your MCP config. Inhalt exposes your whole content tree as typed tools your client can call directly.",
  },
  {
    no: "02",
    title: "Operate on content",
    body: "Your client reads the schema, finds the right entry, and proposes a clean patch against real, typed fields.",
  },
  {
    no: "03",
    title: "Save and publish",
    body: "Every change is checked against your schema, saved, and pushed to your live read API in one step.",
  },
]

export const FEATURES: Feature[] = [
  {
    Icon: PlugIcon,
    title: "MCP-native",
    body: "The protocol is the API. Read, query, and patch content through tools any client already understands.",
  },
  {
    Icon: BoxesIcon,
    title: "Typed schemas",
    body: "Model content once. Clients work strictly inside your fields, validated and never freeform.",
  },
  {
    Icon: FileTextIcon,
    title: "Drafts and review",
    body: "Stage edits, preview them, and publish only when they are ready.",
  },
  {
    Icon: ZapIcon,
    title: "Headless delivery",
    body: "Query from anywhere over a clean, fast read API.",
  },
  {
    Icon: LockIcon,
    title: "Scoped access",
    body: "Grant a client exactly the entries and actions it should touch.",
  },
  {
    Icon: TerminalIcon,
    title: "Self-host",
    body: "One container, your database, your keys. MIT licensed, end to end.",
  },
]
