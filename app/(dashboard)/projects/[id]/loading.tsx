import { Skeleton } from "@/components/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="p-4 text-white sm:p-6">
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-6 h-8 w-56" />
      <Skeleton className="mb-8 h-56 max-w-sm" />
      <Skeleton className="mb-3 h-4 w-16" />
      <div className="mb-4 space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
      <Skeleton className="h-32 max-w-sm" />
    </div>
  );
}