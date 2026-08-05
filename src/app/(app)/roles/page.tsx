import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function RolesIndexPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!profile?.teamId) redirect("/team");

    const roles = await prisma.role.findMany({
        where: { teamId: profile.teamId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { candidates: true } } },
    });

    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Roles
                </h1>
                <Link
                    href="/roles/new"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    New role
                </Link>
            </div>

            <div className="mt-10 space-y-3">
                {roles.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No roles yet. Create one to start uploading resumes against it.
                    </div>
                )}
                {roles.map((role, i) => (
                    <Link
                        key={role.id}
                        href={`/roles/${role.id}`}
                        style={{ animationDelay: `${i * 60}ms` }}
                        className="animate-rise hover-lift flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 hover:border-accent/40"
                    >
                        <div>
                            <p className="font-medium text-foreground">{role.title}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {role.requiredSkills.slice(0, 4).join(", ") || "No required skills set"}
                            </p>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground">
                            {role._count.candidates}
                        </span>
                    </Link>
                ))}
            </div>
        </main>
    );
}
