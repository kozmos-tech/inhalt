// A small inline loading spinner. Inherits the button's text color via
// currentColor, so it reads correctly on both light and dark (primary) buttons.
// Wrap it next to a label with .btn-busy to keep the two centered and spaced.

export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`spinner ${className}`.trim()} aria-hidden />
}
