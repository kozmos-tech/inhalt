import { ConsentForm } from "@/components/features/auth/consent-form"

// OAuth consent screen. better-auth's authorize endpoint redirects here when an
// MCP client (Claude, Cursor, ...) asks the user to approve access - it appends
// consent_code, client_id, and scope. The form posts the decision back to
// /api/auth/oauth2/consent, which mints the code and hands back the redirect.
export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const consentCode = typeof params.consent_code === "string" ? params.consent_code : ""
  const clientId = typeof params.client_id === "string" ? params.client_id : ""
  const scope = typeof params.scope === "string" ? params.scope : ""

  return <ConsentForm consentCode={consentCode} clientId={clientId} scope={scope} />
}
