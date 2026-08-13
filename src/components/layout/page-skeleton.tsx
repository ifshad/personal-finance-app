import { Skeleton } from "@/components/ui/skeleton";

/** Generic loading placeholder for list-style pages (accounts, categories, transactions, budgets). */
export function ListPageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Loading placeholder mirroring the dashboard's card layout. */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-6 p-4 pb-24">
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}
