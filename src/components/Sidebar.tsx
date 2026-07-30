"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
    { href: "/roles", label: "Roles" },
    { href: "/candidates", label: "Candidates" },
    { href: "/calendar", label: "Calendar" },
    { href: "/analytics", label: "Analytics" },
];

export default function Sidebar({ userName }: { userName: string }) {
    const pathname = usePathname();

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
                <p className="truncate px-3 text-xs text-muted-foreground">{userName}</p>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
