import { Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 text-white">
      <Skeleton className="mb-6 h-8 w-40" />

      <div className="mb-8">
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>

      <div className="mb-8">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-14 w-full" />
      </div>

      <div>
        <Skeleton className="mb-3 h-4 w-28" />
        <div className="space-y-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
