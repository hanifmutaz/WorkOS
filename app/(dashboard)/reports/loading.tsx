import { Skeleton } from "@/components/skeleton";

export default function ReportsLoading() {
  return (
    <div className="p-4 text-white sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="mt-8">
        <Skeleton className="mb-3 h-4 w-28" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}