import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";

export default async function TeamPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Team</h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Everyone with access to this workspace.
            </p>

            <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card">
                {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                        <Avatar name={u.name} />
                        <div>
                            <p className="text-sm font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </main>
    );
}
