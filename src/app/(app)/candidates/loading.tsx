import { Skeleton } from "@/components/ui/Skeleton";

export default function CandidatesLoading() {
    return (
        <main className="mx-auto max-w-4xl px-6 py-16">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                ))}
            </div>
            <Skeleton className="mt-8 h-64 w-full" />
        </main>
    );
}
