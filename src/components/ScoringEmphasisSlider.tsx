"use client";

export default function ScoringEmphasisSlider({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground">Scoring emphasis</label>
            <p className="mt-0.5 text-xs text-muted-foreground">
                Bias how the AI scores candidates for this role — toward years of experience or
                toward skill / tech-stack overlap.
            </p>
            <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="mt-3 w-full [accent-color:var(--accent)]"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Experience {100 - value}%</span>
                <span className="font-medium text-foreground">
                    {value === 50 ? "Balanced" : value > 50 ? "Skills-leaning" : "Experience-leaning"}
                </span>
                <span>Skills {value}%</span>
            </div>
        </div>
    );
}
