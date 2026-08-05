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

function NavLink({
    href,
    label,
    active,
    style,
}: {
    href: string;
    label: string;
    active: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <Link
            href={href}
            style={style}
            className={`animate-slide-in group relative block rounded-md px-3 py-2 text-sm font-medium ${active
                ? "bg-accent/10 text-foreground"
                : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground"
                }`}
        >
            {/* Gold active indicator bar */}
            <span
                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent transition-all duration-300 ${active ? "opacity-100" : "opacity-0 -translate-x-1"
                    }`}
            />
            {label}
        </Link>
    );
}

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
                className="flex items-center gap-2.5 border-b border-border px-5 py-5 font-semibold text-foreground"
            >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground shadow-sm">
                    TH
                </span>
                TechHire
            </Link>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV_ITEMS.map((item, i) => (
                    <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        style={{ animationDelay: `${i * 55}ms` }}
                    />
                ))}
            </nav>
            <div className="border-t border-border px-3 py-3">
                <div className="flex items-center gap-2 px-3 py-1.5">
                    <Avatar name={userName} size="sm" />
                    <p className="truncate text-xs text-muted-foreground">{userName}</p>
                </div>
                <NavLink href="/profile" label="Profile" active={pathname === "/profile"} />
                <NavLink href="/settings" label="Settings" active={pathname === "/settings"} />
                <button
                    onClick={handleSignOut}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
