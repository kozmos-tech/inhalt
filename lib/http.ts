// Shared plumbing for the Route Handlers.
//
// Every handler body is wrapped in `handle()` so the routes themselves stay a
// few lines long and every error leaves through one consistent envelope:
//   { error: { code, message, issues? } }
// Throw an ApiError for expected failures (not found, bad request); unexpected
// throws, ZodErrors, and known Prisma error codes are mapped here too.

import { ZodError } from "zod"

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = "ApiError"
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status })
}

// Prisma surfaces failures as `{ code: "P2002" }` etc. We only narrow the few we
// care about, so a light structural check avoids importing the error classes.
function prismaCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code
    return typeof code === "string" ? code : undefined
  }
  return undefined
}

type Handler = () => Promise<Response>

export async function handle(fn: Handler): Promise<Response> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ApiError) {
      return json({ error: { code: error.code, message: error.message } }, error.status)
    }

    if (error instanceof ZodError) {
      return json(
        {
          error: {
            code: "validation_error",
            message: "Request failed validation.",
            issues: error.issues,
          },
        },
        400,
      )
    }

    switch (prismaCode(error)) {
      case "P2002":
        return json(
          { error: { code: "conflict", message: "A record with that identifier already exists." } },
          409,
        )
      case "P2025":
        return json({ error: { code: "not_found", message: "Record not found." } }, 404)
    }

    console.error("Unhandled API error:", error)
    return json({ error: { code: "internal_error", message: "Something went wrong." } }, 500)
  }
}
