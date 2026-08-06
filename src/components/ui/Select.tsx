"use client";

/**
 * A themed `<select>` with a custom chevron. Native select arrows don't follow
 * the app's palette; this hides the native arrow (appearance-none) and overlays
 * an on-theme chevron. Pass the usual select props plus `className` for layout
 * (e.g. `w-full`) applied to the wrapper.
 */
export default function Select({
    className = "",
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className={`relative inline-flex ${className}`}>
            <select
                {...props}
                className="w-full cursor-pointer appearance-none rounded-md border border-border bg-card py-2 pl-3 pr-9 text-sm text-foreground transition-colors hover:border-muted-foreground/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
                {children}
            </select>
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
                <path d="m6 9 6 6 6-6" />
            </svg>
        </div>
    );
}
