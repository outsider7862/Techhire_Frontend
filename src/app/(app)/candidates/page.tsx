"use client";
import { getCandidateDisplayName } from "@/lib/displayName";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import Select from "@/components/ui/Select";

type Candidate = {
    id: string;
    fileName: string;
    name: string | null;
    email: string | null;
    score: number | null;
    skills: string[];
    stage: string;
    roleId: string;
    role: { title: string };
};

function toCsv(rows: Candidate[]): string {
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const headers = ["Name", "Email", "Role", "Score", "Stage", "Skills"];
    const lines = [headers.join(",")];
    for (const c of rows) {
        lines.push(
            [
                escape(getCandidateDisplayName(c)),
                escape(c.email ?? ""),
                escape(c.role.title),
                c.score ?? "",
                escape(c.stage),
                escape(c.skills.join("; ")),
            ].join(",")
        );
    }
    return lines.join("\n");
}

function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

type Role = { id: string; title: string };

const STAGES = ["", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED", "HIRED"];

export default function CandidatesSearchPage() {
    const toast = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [query, setQuery] = useState("");
    const [minYears, setMinYears] = useState("");
    const [roleId, setRoleId] = useState("");
    const [stage, setStage] = useState("");
    const [results, setResults] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/roles")
            .then((res) => res.json())
            .then(setRoles);
    }, []);

    const runSearch = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (minYears) params.set("minYears", minYears);
        if (roleId) params.set("roleId", roleId);
        if (stage) params.set("stage", stage);

        try {
            const res = await fetch(`/api/candidates/search?${params.toString()}`);
            if (!res.ok) throw new Error("Search failed");
            setResults(await res.json());
        } catch {
            toast.error("Search failed — please try again.");
        } finally {
            setLoading(false);
        }
    }, [query, minYears, roleId, stage, toast]);

    useEffect(() => {
        const timeout = setTimeout(runSearch, 300);
        return () => clearTimeout(timeout);
    }, [runSearch]);

    return (
        <main className="mx-auto max-w-4xl px-6 py-16">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Candidates
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Search scored candidates across every role by skill, keyword, or experience.
                    </p>
                </div>
                <button
                    onClick={() => downloadCsv(toCsv(results), "candidates.csv")}
                    disabled={results.length === 0}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                    Export CSV
                </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Keyword, skill, or tech..."
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground sm:col-span-2"
                />
                <input
                    type="number"
                    min={0}
                    value={minYears}
                    onChange={(e) => setMinYears(e.target.value)}
                    placeholder="Min years"
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                <Select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full"
                >
                    <option value="">All roles</option>
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.title}
                        </option>
                    ))}
                </Select>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {STAGES.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStage(s)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${stage === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                            }`}
                    >
                        {s ? s.charAt(0) + s.slice(1).toLowerCase() : "All stages"}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                {loading && <p className="text-sm text-muted-foreground">Searching…</p>}
                {!loading && results.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No matching candidates.
                    </div>
                )}
                {!loading && results.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                                    <th className="px-4 py-2.5 font-medium">Candidate</th>
                                    <th className="px-4 py-2.5 font-medium">Role</th>
                                    <th className="px-4 py-2.5 font-medium">Score</th>
                                    <th className="px-4 py-2.5 font-medium">Skills</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((c, i) => (
                                    <tr
                                        key={c.id}
                                        style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                                        className="animate-rise border-b border-border last:border-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/roles/${c.roleId}/candidates/${c.id}`}
                                                className="font-medium text-foreground underline-offset-2 hover:underline"
                                            >
                                                {getCandidateDisplayName(c)}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.role.title}</td>
                                        <td className="px-4 py-3 font-mono font-semibold text-foreground">
                                            {c.score ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {c.skills.slice(0, 5).join(", ")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}