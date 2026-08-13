import { redirect } from "next/navigation";

// Middleware guarantees a session exists for any request that reaches this
// page, so the only sensible landing spot is the dashboard.
export default function Home() {
  redirect("/dashboard");
}
