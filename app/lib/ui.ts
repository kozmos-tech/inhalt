// Shared className strings so every surface speaks the same monochrome,
// control-surface language. Dark canvas, hairline borders, one near-white accent.

export const input =
  "h-10 w-full rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.04] focus:ring-2 focus:ring-white/10"

export const primaryButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-zinc-50 px-4 text-sm font-medium text-zinc-950 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] transition hover:bg-white active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] disabled:pointer-events-none disabled:opacity-40"

export const ghostButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-zinc-100 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15"

export const label = "text-[13px] font-medium text-zinc-300"

// Mono, uppercase, letter-spaced eyebrow used to title every section.
export const eyebrow =
  "font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500"
