"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";

export default function EditRolePage() {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const params = useParams<{ roleId: string }>();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState("");
    const [minYears, setMinYears] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/roles/${params.roleId}`)
            .then((res) => res.json())
            .then((role) => {
                setTitle(role.title);
                setDescription(role.description);
                setSkills(role.requiredSkills.join(", "));
                setMinYears(role.minYearsExperience);
                setLoading(false);
            });
    }, [params.roleId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`/api/roles/${params.roleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    requiredSkills: skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    minYearsExperience: minYears,
                }),
            });
            if (!res.ok) throw new Error("Failed to save role");
            toast.success("Role updated.");
            router.push(`/roles/${params.roleId}`);
            router.refresh();
        } catch {
            toast.error("Couldn't save changes — please try again.");
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        const ok = await confirm({
            title: "Delete role?",
            body: "This deletes the role and all its candidates. This can't be undone.",
            confirmText: "Delete role",
            destructive: true,
        });
        if (!ok) return;
        await fetch(`/api/roles/${params.roleId}`, { method: "DELETE" });
        toast.success("Role deleted.");
        router.push("/roles");
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-xl px-6 py-16 text-sm text-muted-foreground">
                Loading…
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-xl px-6 py-16">
            <Breadcrumbs
                items={[
                    { label: "Roles", href: "/roles" },
                    { label: title, href: `/roles/${params.roleId}` },
                    { label: "Edit" },
                ]}
            />
            <h1 className="text-xl font-semibold text-foreground">Edit role</h1>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-foreground">Title</label>
                    <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground">
                        Required skills (comma separated)
                    </label>
                    <input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground">
                        Minimum years of experience
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={minYears}
                        onChange={(e) => setMinYears(Number(e.target.value))}
                        className="mt-1 w-32 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {submitting ? "Saving…" : "Save changes"}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-md px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                        Delete role
                    </button>
                </div>
            </form>
        </main>
    );
}