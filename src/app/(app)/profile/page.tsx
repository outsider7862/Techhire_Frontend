import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const session = await auth();
    const user = await prisma.user.findUnique({
        where: { id: session!.user.id },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    return (
        <main className="mx-auto max-w-lg px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
            <ProfileForm user={user!} />
        </main>
    );
}
