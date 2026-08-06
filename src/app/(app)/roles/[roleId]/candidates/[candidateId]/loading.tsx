import { Skeleton } from "@/components/ui/Skeleton";

export default function CandidateLoading() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <Skeleton className="h-4 w-56" />
            <div className="mt-5 flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
            <div className="mt-8 space-y-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </main>
    );
}
