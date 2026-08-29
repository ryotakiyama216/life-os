import { Skeleton } from "@/components/ui/skeleton";

export function TodaySkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-9 w-full" />
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
}
