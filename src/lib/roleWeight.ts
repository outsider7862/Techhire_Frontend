/** Coerce an incoming scoring emphasis to a 0-100 integer (default 50). */
export function clampWeight(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return 50;
    return Math.max(0, Math.min(100, Math.round(n)));
}
