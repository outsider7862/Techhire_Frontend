export default function RolesLoading() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <div className="flex items-center justify-between">
                <div className="h-7 w-24 animate-pulse rounded bg-muted" />
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="mt-10 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
                    />
                ))}
            </div>
        </main>
    );
}