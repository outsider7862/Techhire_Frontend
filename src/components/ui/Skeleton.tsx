export function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`shimmer rounded-md bg-muted ${className}`} aria-hidden="true" />;
}
