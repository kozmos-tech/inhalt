import { Wordmark } from "../components/wordmark"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-9 flex flex-col items-center gap-3.5">
          <Wordmark />
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-zinc-600">
            The CMS your AI tools can run
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
