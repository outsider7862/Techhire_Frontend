"use client";

/**
 * A themed numeric stepper: a −/value/+ control that replaces the browser's
 * native number spinners (which don't respect the app's dark theme). The value
 * is still directly editable by typing into the middle field.
 */
export default function NumberStepper({
    value,
    onChange,
    min = 0,
    max = Number.POSITIVE_INFINITY,
    step = 1,
    className = "",
    "aria-label": ariaLabel,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    "aria-label"?: string;
}) {
    const clamp = (n: number) => Math.max(min, Math.min(max, n));

    const btn =
        "flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground";

    return (
        <div
            className={`inline-flex items-center overflow-hidden rounded-md border border-border bg-card ${className}`}
        >
            <button
                type="button"
                aria-label="Decrease"
                onClick={() => onChange(clamp(value - step))}
                disabled={value <= min}
                className={btn}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
            <input
                type="number"
                aria-label={ariaLabel}
                value={value}
                min={min}
                max={Number.isFinite(max) ? max : undefined}
                step={step}
                onChange={(e) => {
                    const n = Number(e.target.value);
                    onChange(Number.isFinite(n) ? clamp(n) : min);
                }}
                className="h-9 w-12 border-x border-border bg-transparent text-center text-sm font-medium text-foreground focus:outline-none"
            />
            <button
                type="button"
                aria-label="Increase"
                onClick={() => onChange(clamp(value + step))}
                disabled={value >= max}
                className={btn}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        </div>
    );
}
