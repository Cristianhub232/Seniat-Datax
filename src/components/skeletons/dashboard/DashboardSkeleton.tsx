import { SkeletonLayoutA } from "./layout/SkeletonLayoutA";
import { SkeletonLayoutB } from "./layout/SkeletonLayoutB";

type DashboardVariant = 'A' | 'B';

export function DashboardSkeleton({ variant }: { variant: DashboardVariant }) {
    const layouts = {
        A: <SkeletonLayoutA />,
        B: <SkeletonLayoutB />,
    };

    return layouts[variant] ?? null;
}