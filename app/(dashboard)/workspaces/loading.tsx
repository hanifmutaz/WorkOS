import { Skeleton } from "@/components/skeleton";

export default function WorkspacesLoading() {
  return (
    <div className="p-4 text-white sm:p-6">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-40 max-w-sm" />
    </div>
  );
}