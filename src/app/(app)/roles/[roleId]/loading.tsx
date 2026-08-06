import { Skeleton } from "@/components/ui/Skeleton";

export default function RoleLoading() {
    return (
        <main className="mx-auto max-w-4xl px-6 py-16">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-48" />
            <Skeleton className="mt-8 h-24 w-full" />
            <div className="mt-8 flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="mt-6 h-64 w-full" />
        </main>
    );
}
