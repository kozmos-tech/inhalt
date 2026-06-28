export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main>
      <h1>Inhalt</h1>
      <p>The CMS your AI tools can run</p>
      <hr />
      {children}
    </main>
  )
}
