"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Avatar from "@/components/Avatar";

const NAV_ITEMS = [
    { href: "/roles", label: "Roles" },
    { href: "/candidates", label: "Candidates" },
    { href: "/calendar", label: "Calendar" },
    { href: "/analytics", label: "Analytics" },
    { href: "/team", label: "Team" },
];

export default function Sidebar({ userName }: { userName: string }) {
    const pathname = usePathname();
    const router = useRouter();

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
            <Link
                href="/roles"
                className="border-b border-border px-5 py-5 font-semibold text-foreground"
            >
                TechHire Copilot
            </Link>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV_ITEMS.map((item) => {
                    const active =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-border px-3 py-3">
                <div className="flex items-center gap-2 px-3 py-1.5">
                    <Avatar name={userName} size="sm" />
                    <p className="truncate text-xs text-muted-foreground">{userName}</p>
                </div>
                <Link
                    href="/profile"
                    className={`mt-1 block rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/profile"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                >
                    Profile
                </Link>
                <Link
                    href="/settings"
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/settings"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                >
                    Settings
                </Link>
                <button
                    onClick={handleSignOut}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
