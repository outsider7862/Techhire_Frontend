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
                        <BarChart data={stageData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            {/* interval={0} forces every stage label to render — without it
                                recharts silently drops overlapping ticks, leaving bars
                                sitting under the wrong stage name. */}
                            <XAxis
                                dataKey="stage"
                                interval={0}
                                tick={{ fontSize: 10 }}
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                            <Tooltip />
                            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-medium text-muted-foreground">Candidates per role</h2>
                <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        {/* Horizontal bars: role titles are long and arbitrary, so they
                            read along the y-axis instead of being dropped or overlapping
                            as vertical ticks. Titles are truncated for the axis; the
                            tooltip still shows the full one. */}
                        <BarChart data={roleData} layout="vertical" margin={{ left: 4, right: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
                            <Tooltip />
                            <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
