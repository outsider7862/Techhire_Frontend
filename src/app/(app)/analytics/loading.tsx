import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyticsLoading() {
    return (
        <main className="mx-auto max-w-5xl px-6 py-16">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="mt-2 h-4 w-64" />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[76px]" />
                ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[76px]" />
                ))}
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
            </div>
        </main>
    );
}
