import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLayoutB() {
    return (
        <div className="p-6 space-y-4 rounded-xl bg-white border-0 shadow-lg">
            {/** 1. Header pills  */}
            <div className="flex justify-between space-x-3">
                <Skeleton className="h-6 w-81 rounded-sm" />
                <Skeleton className="h-6 w-48 rounded-sm" />
            </div>

            {/** 2. Subtítulo o filtro (el recuadro individual justo debajo) */}
            <Skeleton className="h-6 w-42 rounded-sm mt-8 mb-2" />

            {/** 4. Grid de métricas (el bloque grande a la izq + los 6 pequeños a la derecha) */}
            <div className="grid grid-cols-3 grid-rows-1 gap-4">
                <Skeleton className="h-92 col-span-2 row-span-2 rounded-sm" />
                <Skeleton className="h-92 rounded-sm" />
            </div>
        </div>
    );
}