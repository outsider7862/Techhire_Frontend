import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import TeamOnboarding from "./TeamOnboarding";
import Avatar from "@/components/Avatar";

export default async function TeamPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: { team: { include: { members: true } } },
    });

    if (!profile?.team) {
        return (
            <main className="mx-auto max-w-md px-6 py-16">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Team</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a team, or join one with a code from a teammate.
                </p>
                <TeamOnboarding />
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {profile.team.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Share this code so teammates can join:{" "}
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-foreground">
                    {profile.team.joinCode}
                </span>
            </p>

            <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card">
                {profile.team.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                        <Avatar name={m.name} />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {m.name}
                                {m.id === profile.team!.ownerId && (
                                    <span className="ml-2 text-xs text-muted-foreground">Owner</span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">
                            Joined {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </main>
    );
}
