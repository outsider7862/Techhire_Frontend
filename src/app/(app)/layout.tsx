import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="flex min-h-screen">
            <Sidebar userName={session.user.name ?? session.user.email ?? "Account"} />
            <div className="flex-1 overflow-x-hidden">{children}</div>
        </div>
    );
}