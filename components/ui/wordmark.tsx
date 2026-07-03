import Link from "next/link"
import Image from "next/image"

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
      <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-[8px] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_6px_14px_-6px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:-translate-y-px">
        <Image src="/icon.png" alt="" width={28} height={28} className="h-full w-full object-cover" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-zinc-50">
        Inhalt
      </span>
    </Link>
  )
}
