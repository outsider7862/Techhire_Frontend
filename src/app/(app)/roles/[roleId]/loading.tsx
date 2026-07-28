export default function RoleLoading() {
    return (
        <main className="mx-auto max-w-4xl px-6 py-16">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-8 h-24 animate-pulse rounded-lg border border-dashed border-border bg-muted/30" />
            <div className="mt-8 h-64 animate-pulse rounded-lg border border-border bg-muted/20" />
        </main>
    );
}