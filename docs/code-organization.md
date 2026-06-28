# Code organization

How this repo is laid out and where new code goes. The goal is that the answer
to "where does this belong?" is always obvious.

## Top-level layout

```
app/          Next.js routes only (pages, layouts, route handlers) + co-located UI
components/   Reusable components shared across routes
  ui/         Presentational primitives (no domain knowledge)
  features/   Domain components, grouped by feature
lib/          Reusable, non-component helpers, grouped by entity
docs/         Documentation
tests/        Test suite
```

`@/*` maps to the project root, so imports read `@/lib/...` and
`@/components/...` rather than `../../../lib/...`. Always use the `@/` alias for
cross-folder imports; reserve relative imports (`./x`, `../x`) for siblings
within the same feature or folder.

## `.tsx` files hold one component

A component file contains only its `Props` type and the component itself:

```tsx
type ThingProps = { ... }

export function Thing({ ... }: ThingProps) { ... }
```

Everything else moves out:

- **Constants** (config strings, option lists) -> a `utils/constants.ts`.
- **Helpers** (formatting, parsing) -> `utils/` (page-local) or `lib/` (shared).
- **Sub-components** -> a `_components/` folder next to the file.
- **Shared types** -> a `utils/types.ts`, so the `.tsx` keeps only its `Props`.

The page or top-level component keeps the state and wiring; the extracted
sub-components stay presentational and take their data through props.

## `lib/` - reusable helpers, grouped by entity

One folder per entity, files named for what they do (no redundant prefixes -
`keys/client.ts`, not `keys/keys-client.ts`):

```
lib/
  auth/      server.ts  client.ts  bearer.ts  session.ts
  content/   fields.ts  lookup.ts  operations.ts
  keys/      tokens.ts  scopes.ts  client.ts
  hooks/     use-clipboard.ts        # cross-cutting React hooks
  http.ts                            # route-handler plumbing (errors, json, handle)
  prisma.ts                          # Prisma client singleton
  project.ts                         # tenant (project) resolution
```

Guidelines:

- A single-purpose module can be one file at the `lib/` root (`prisma.ts`).
  When it grows past one concern, promote it to a folder (`project.ts` ->
  `project/`). Multi-file concerns are folders from the start.
- No barrel `index.ts` files. Import the specific module
  (`@/lib/auth/server`). This keeps server-only and client-only code from
  being pulled into the wrong bundle through a shared barrel.
- A helper is "reusable" (and belongs in `lib/`) once a second caller needs it,
  or it is generic by nature (clipboard, date formatting). Until then, keep it
  co-located with its one caller.

## `components/` - reusable components

```
components/
  ui/                    Presentational primitives, no domain knowledge
    copy-button.tsx  icons.tsx  wordmark.tsx
  features/              Domain components, grouped by feature
    auth/auth-form.tsx
```

- `ui/` is for primitives reused anywhere and unaware of any entity.
- `features/<feature>/` is for components tied to a domain (auth, keys, ...).
- A component that needs its own helpers or sub-parts gets a folder named after
  it, with `_components/` and `utils/` inside (see below).

## Co-locating a component's own parts

When a route or component needs sub-parts and helpers, keep them next to it
rather than in the shared folders. The dashboard is the worked example:

```
app/dashboard/
  page.tsx                  # state + wiring only
  _components/
    dashboard-tabs.tsx
    connection-panel.tsx
    keys-panel.tsx
    create-key-dialog.tsx
    reveal-key-dialog.tsx
  utils/
    constants.ts            # ENDPOINT, CONFIG
    format.ts               # page-local formatDate
    types.ts                # DashboardTab
```

- `_components/` - sub-components used only by this surface. The leading
  underscore tells Next.js it is not a route.
- `utils/` - constants, helpers, and types used only by this surface.
- Promote anything to `components/` or `lib/` the moment a second surface needs
  it.

## Quick reference

| You have...                                  | It goes in...                         |
| -------------------------------------------- | ------------------------------------- |
| A route, layout, or API handler              | `app/...`                             |
| A primitive reused anywhere (no domain)      | `components/ui/`                      |
| A component tied to one feature              | `components/features/<feature>/`      |
| A helper reused across the app               | `lib/<entity>/`                       |
| A React hook reused across the app           | `lib/hooks/`                          |
| A sub-component used by one surface only      | `<surface>/_components/`              |
| A constant, helper, or type for one surface  | `<surface>/utils/`                    |
