// Minimal inline icon set (lucide-style strokes) so we avoid an icon dependency.

type IconProps = {
  className?: string
  size?: number
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
}

export function CopyIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function CheckIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function PlusIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function KeyIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  )
}

export function TerminalIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  )
}

export function PlugIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </svg>
  )
}

export function LogOutIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export function TrashIcon({ className = "", size = 14 }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
