import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonContribuyente() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-64 bg-red-200/40" />
        <Skeleton className="h-6 w-40 bg-red-100/40" />
      </div>

      <div className="flex w-1/2 ">
        <Skeleton className="h-5 w-10 rounded-md bg-red-100/40" />
        <Skeleton className="h-5 w-20 rounded-md bg-red-100/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
        <Skeleton className="h-20 rounded-xl bg-red-200/40" />
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
      </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
        <Skeleton className="h-20 rounded-xl bg-red-100/40" />
      </div>

    </div>
  );
}
