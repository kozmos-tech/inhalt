# Development

Running the Inhalt repo locally. It is a [Next.js](https://nextjs.org) application
backed by Postgres (via Prisma).

## Prerequisites

- Node.js and npm
- A Postgres database (Neon, local Postgres, or the Docker setup once available —
  see [roadmap/self-host.md](roadmap/self-host.md))

## Environment

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Postgres connection string used by Prisma.
- `BETTER_AUTH_SECRET` — secret for signing sessions. Generate with
  `openssl rand -base64 32`.
- `BETTER_AUTH_URL` — your app's origin, no trailing slash
  (`http://localhost:3000` in dev, `https://app.inhalt.tech` in production).

## Setup

```bash
npm install              # also generates the Prisma client (postinstall)
npm run db:push          # creates the tables on your database
npm run dev              # start the dev server on http://localhost:3000
```

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npm test         # test suite
npm run db:push  # push the Prisma schema to the database
```

## Notes

- This Next build renames *middleware* to **proxy**: route guards live in `proxy.ts`
  at the project root, not `middleware.ts`.
- The Prisma client is generated to `app/generated/prisma` (gitignored).
