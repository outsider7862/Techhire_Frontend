"use client";

import { useEffect, useRef } from "react";

/**
 * Animates a number from 0 up to `value` on mount (eases out), writing to the
 * DOM node directly so there's no per-frame React state churn. Jumps straight
 * to the final value when the user prefers reduced motion.
 */
export default function CountUp({
    value,
    durationMs = 900,
    className,
}: {
    value: number;
    durationMs?: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce || value === 0) {
            el.textContent = String(value);
            return;
        }

        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            el.textContent = String(Math.round(value * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, durationMs]);

    // Starts at 0 and counts up once mounted; reduced-motion users get the
    // final value set immediately by the effect.
    return (
        <span ref={ref} className={className}>
            0
        </span>
    );
}
