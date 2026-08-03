import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import AnalyticsCharts from "./AnalyticsCharts";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED", "HIRED"] as const;

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!profile?.teamId) redirect("/team");

    const teamId = profile.teamId;

    const [roleCount, statusCounts, stageCounts, avgScoreResult, roles, scoredCandidates] =
        await Promise.all([
            prisma.role.count({ where: { teamId } }),
            prisma.candidate.groupBy({
                by: ["status"],
                _count: true,
                where: { role: { teamId } },
            }),
            prisma.candidate.groupBy({
                by: ["stage"],
                _count: true,
                where: { role: { teamId } },
            }),
            prisma.candidate.aggregate({
                where: { status: "SCORED", role: { teamId } },
                _avg: { score: true },
            }),
            prisma.role.findMany({
                where: { teamId },
                select: { title: true, _count: { select: { candidates: true } } },
            }),
            prisma.candidate.findMany({
                where: { status: "SCORED", scoredAt: { not: null }, role: { teamId } },
                select: { createdAt: true, scoredAt: true },
            }),
        ]);

    const totalCandidates = statusCounts.reduce((sum, s) => sum + s._count, 0);
    const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
    const stageData = STAGES.map((stage) => ({
        stage: stage.charAt(0) + stage.slice(1).toLowerCase(),
        count: stageCounts.find((s) => s.stage === stage)?._count ?? 0,
    }));
    const roleData = roles
        .map((r) => ({ title: r.title, count: r._count.candidates }))
        .sort((a, b) => b.count - a.count);

    const avgScoreTimeMs =
        scoredCandidates.length > 0
            ? scoredCandidates.reduce(
                (sum, c) => sum + (c.scoredAt!.getTime() - c.createdAt.getTime()),
                0
            ) / scoredCandidates.length
            : null;

    return (
        <main className="mx-auto max-w-5xl px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Aggregate stats across your team&apos;s roles and candidates.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Roles" value={roleCount} />
                <StatCard label="Candidates" value={totalCandidates} />
                <StatCard
                    label="Avg. score"
                    value={avgScoreResult._avg.score ? Math.round(avgScoreResult._avg.score) : "—"}
                />
                <StatCard
                    label="Avg. time to score"
                    value={avgScoreTimeMs !== null ? formatDuration(avgScoreTimeMs) : "—"}
                />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
                <StatCard label="Scored" value={statusMap.SCORED ?? 0} />
                <StatCard label="Pending" value={statusMap.PENDING ?? 0} />
                <StatCard label="Failed to parse" value={statusMap.FAILED ?? 0} />
            </div>

            <AnalyticsCharts stageData={stageData} roleData={roleData} />
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</p>
        </div>
    );
}

function formatDuration(ms: number): string {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
}
