import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });

    return (
        <div className="flex min-h-screen">
            <Sidebar userName={profile?.name ?? user.email ?? "Account"} />
            <div className="flex-1 overflow-x-hidden">{children}</div>
        </div>
    );
}
