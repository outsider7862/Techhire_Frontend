"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [{ href: "/roles", label: "Roles" }];

export default function Sidebar() {
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
        </aside>
    );
}