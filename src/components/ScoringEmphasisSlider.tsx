"use client";

export default function ScoringEmphasisSlider({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    const experience = 100 - value;
    const mode =
        value === 50 ? "Balanced" : value > 50 ? "Skills-leaning" : "Experience-leaning";

    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Scoring emphasis</label>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {mode}
                </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
                Bias how the AI scores candidates for this role — toward years of experience or
                toward skill / tech-stack overlap.
            </p>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                        {experience}
                        <span className="ml-0.5 text-xs font-normal text-muted-foreground">%</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Skills</p>
                    <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                        {value}
                        <span className="ml-0.5 text-xs font-normal text-muted-foreground">%</span>
                    </p>
                </div>
            </div>

            <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="th-range mt-2.5"
                style={{ "--pct": `${value}%` } as React.CSSProperties}
                aria-label="Scoring emphasis: experience versus skills"
            />

            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>Experience-weighted</span>
                <span>Skills-weighted</span>
            </div>
        </div>
    );
}
