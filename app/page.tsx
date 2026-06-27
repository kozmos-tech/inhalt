import { redirect } from "next/navigation"

export default function Home() {
  // The signed-in check runs client-side; the dashboard bounces to /login if
  // there is no session.
  redirect("/dashboard")
}
