const COLORS = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-cyan-500",
];

function colorFor(name: string): string {
    const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return COLORS[sum % COLORS.length];
}

function initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
    name,
    size = "md",
}: {
    name: string;
    size?: "sm" | "md" | "lg";
}) {
    const dimensions =
        size === "lg" ? "h-12 w-12 text-base" : size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";

    return (
        <div
            className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full font-medium text-white ${colorFor(
                name
            )}`}
        >
            {initialsFor(name)}
        </div>
    );
}
