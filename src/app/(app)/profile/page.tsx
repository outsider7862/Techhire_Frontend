import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const supabase = await createClient();
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    // The (app) layout already redirects unauthenticated users, but the page
    // renders concurrently with the layout, so guard here too rather than
    // asserting non-null — otherwise this crashes before the redirect lands.
    if (!authUser) redirect("/login");

    const user = await prisma.profile.findUnique({
        where: { id: authUser.id },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    return (
        <main className="animate-rise mx-auto max-w-lg px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
            <ProfileForm user={user!} />
        </main>
    );
}
