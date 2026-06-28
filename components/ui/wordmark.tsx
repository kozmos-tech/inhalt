import Link from "next/link"

export function Wordmark({
  href = "/",
  className = "",
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label="Inhalt"
      className={
        "group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] " +
        className
      }
    >
      <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-zinc-50 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_6px_14px_-6px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:-translate-y-px">
        {/* stacked content lines */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="2.5" y="3" width="9" height="1.6" rx="0.8" fill="#08080a" fillOpacity="0.95" />
          <rect x="2.5" y="6.2" width="9" height="1.6" rx="0.8" fill="#08080a" fillOpacity="0.55" />
          <rect x="2.5" y="9.4" width="5.5" height="1.6" rx="0.8" fill="#08080a" fillOpacity="0.32" />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-zinc-50">
        Inhalt
      </span>
    </Link>
  )
}
