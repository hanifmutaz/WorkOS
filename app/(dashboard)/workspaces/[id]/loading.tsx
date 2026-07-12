import { Skeleton } from "@/components/skeleton";

export default function WorkspaceDetailLoading() {
  return (
    <div className="p-6 text-white">
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-6 h-8 w-56" />
      <Skeleton className="mb-8 h-48 max-w-sm" />
      <Skeleton className="mb-3 h-4 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
