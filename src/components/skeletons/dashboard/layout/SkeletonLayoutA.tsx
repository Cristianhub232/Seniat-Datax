import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLayoutA() {
    return (
        <div className="p-6 space-y-4 rounded-xl bg-white border-0 shadow-lg">

            <div className="flex justify-between space-x-3">
                <Skeleton className="h-6 w-48 rounded-sm" />
                <Skeleton className="h-6 w-48 rounded-sm" />
            </div>
            {/** 1. Header pills (los tres recuadros pequeños en la cabecera) */}
            <div className="flex space-x-3">
                <Skeleton className="h-4 w-24 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-sm" />
            </div>

            {/** 2. Subtítulo o filtro (el recuadro individual justo debajo) */}
            <Skeleton className="h-6 w-42 rounded-sm" />

            {/** 3. Gráfico principal (el bloque ancho grande) */}
            <Skeleton className="h-32 w-full rounded-sm" />

            {/** 4. Grid de métricas (el bloque grande a la izq + los 6 pequeños a la derecha) */}
            <div className="grid grid-cols-4 grid-rows-2 gap-4">
                {/** bloque grande que ocupa 2 cols × 2 rows */}
                <Skeleton className="col-span-2 row-span-2 h-full rounded-sm" />

                {/** los 6 bloques pequeños, 3 en la fila de arriba y 3 en la de abajo */}
                <Skeleton className="h-24 rounded-sm" />
                <Skeleton className="h-24 rounded-sm" />
                <Skeleton className="h-24 rounded-sm" />
                <Skeleton className="h-24 rounded-sm" />
            </div>
        </div>
    );
}