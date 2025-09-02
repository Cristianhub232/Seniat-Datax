import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTable() {
    return (
        <div className="space-y-4 ">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-8 w-[80px] rounded-md" />
                </div>
            ))}
        </div>
    );
}