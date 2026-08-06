import { Skeleton } from "@/components/ui/Skeleton";

export default function RolesLoading() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="mt-10 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        </main>
    );
}
