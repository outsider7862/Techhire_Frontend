"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

type StageDatum = { stage: string; count: number };
type RoleDatum = { title: string; count: number };

// Themed tooltip so it reads as a proper card in both light and dark, instead
// of Recharts' default white box (which ghosted out over the dark theme).
const tooltipProps = {
    contentStyle: {
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontSize: 12,
        color: "var(--foreground)",
        boxShadow: "0 10px 30px -12px rgba(0,0,0,0.35)",
        padding: "6px 10px",
    },
    labelStyle: { color: "var(--foreground)", fontWeight: 600, marginBottom: 2 },
    itemStyle: { color: "var(--muted-foreground)" },
    cursor: { fill: "rgba(120,113,108,0.12)" },
};

export default function AnalyticsCharts({
    stageData,
    roleData,
}: {
    stageData: StageDatum[];
    roleData: RoleDatum[];
}) {
    return (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-medium text-muted-foreground">Pipeline funnel</h2>
                <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        {/* Horizontal bars: the six stage names read cleanly down the
                            y-axis instead of overlapping as crammed vertical ticks. */}
                        <BarChart data={stageData} layout="vertical" margin={{ left: 4, right: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis
                                type="category"
                                dataKey="stage"
                                width={74}
                                interval={0}
                                tick={{ fontSize: 11 }}
                                stroke="var(--muted-foreground)"
                            />
                            <Tooltip {...tooltipProps} />
                            <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-medium text-muted-foreground">Candidates per role</h2>
                <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        {/* Role titles are long and arbitrary, so they read along the
                            y-axis; truncated on the axis, full name in the tooltip. */}
                        <BarChart data={roleData} layout="vertical" margin={{ left: 4, right: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis
                                type="category"
                                dataKey="title"
                                width={110}
                                interval={0}
                                tick={{ fontSize: 11 }}
                                tickFormatter={(title: string) =>
                                    title.length > 16 ? `${title.slice(0, 15)}…` : title
                                }
                                stroke="var(--muted-foreground)"
                            />
                            <Tooltip {...tooltipProps} />
                            <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
