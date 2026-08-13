import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-4 pb-24 text-center">
      <h1 className="text-lg font-semibold text-foreground">Not found</h1>
      <p className="text-sm text-muted-foreground">
        This page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
    </div>
  );
}
