// Page-local formatting helpers for the dashboard. Reusable across the whole
// app would live in lib/; this stays here because only the keys table needs it.

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
