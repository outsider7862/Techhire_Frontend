"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { createClient } from "@/utils/supabase/client";
import Avatar from "@/components/Avatar";

/* --- Icons (Lucide-style, 18px) ----------------------------------------- */

function Icon({ name }: { name: string }) {
    const common = {
        width: 18,
        height: 18,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        className: "shrink-0",
        "aria-hidden": true,
    };
    switch (name) {
        case "roles":
            return (
                <svg {...common}>
                    <rect width="20" height="14" x="2" y="7" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            );
        case "candidates":
            return (
                <svg {...common}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        case "calendar":
            return (
                <svg {...common}>
                    <path d="M8 2v4M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                </svg>
            );
        case "analytics":
            return (
                <svg {...common}>
                    <path d="M3 3v18h18" />
                    <path d="M7 16v-5M12 16V8M17 16v-3" />
                </svg>
            );
        case "team":
            return (
                <svg {...common}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6M22 11h-6" />
                </svg>
            );
        case "profile":
            return (
                <svg {...common}>
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case "settings":
            return (
                <svg {...common}>
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        case "signout":
            return (
                <svg {...common}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="m16 17 5-5-5-5M21 12H9" />
                </svg>
            );
        case "chevron":
            return (
                <svg {...common} width={16} height={16}>
                    <path d="m15 18-6-6 6-6" />
                </svg>
            );
        default:
            return null;
    }
}

/* --- Collapse state (persisted, hydration-safe) ------------------------- */

const STORE_KEY = "sidebar-collapsed";

function subscribe(cb: () => void) {
    window.addEventListener("sidebar-toggle", cb);
    window.addEventListener("storage", cb);
    return () => {
        window.removeEventListener("sidebar-toggle", cb);
        window.removeEventListener("storage", cb);
    };
}

function useCollapsed(): [boolean, () => void] {
    const collapsed = useSyncExternalStore(
        subscribe,
        () => localStorage.getItem(STORE_KEY) === "1",
        () => false
    );
    const toggle = () => {
        const next = localStorage.getItem(STORE_KEY) !== "1";
        localStorage.setItem(STORE_KEY, next ? "1" : "0");
        window.dispatchEvent(new Event("sidebar-toggle"));
    };
    return [collapsed, toggle];
}

/* --- Nav link ----------------------------------------------------------- */

function NavLink({
    href,
    label,
    icon,
    active,
    collapsed,
    style,
}: {
    href: string;
    label: string;
    icon: string;
    active: boolean;
    collapsed: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            style={style}
            className={`animate-slide-in relative flex items-center rounded-md py-2 text-sm font-medium ${collapsed ? "justify-center px-2" : "gap-3 px-3"
                } ${active
                    ? "bg-accent/10 text-foreground"
                    : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground"
                }`}
        >
            <span
                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent transition-all duration-300 ${active ? "opacity-100" : "-translate-x-1 opacity-0"
                    }`}
            />
            <Icon name={icon} />
            {!collapsed && <span className="animate-fade">{label}</span>}
        </Link>
    );
}

const NAV_ITEMS = [
    { href: "/roles", label: "Roles", icon: "roles" },
    { href: "/candidates", label: "Candidates", icon: "candidates" },
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/analytics", label: "Analytics", icon: "analytics" },
    { href: "/team", label: "Team", icon: "team" },
];

export default function Sidebar({ userName }: { userName: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, toggleCollapsed] = useCollapsed();

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <aside
            className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-out ${collapsed ? "w-16" : "w-60"
                }`}
        >
            {/* Header / brand + collapse toggle */}
            <div
                className={`flex border-b border-border py-4 ${collapsed ? "flex-col items-center gap-3 px-2" : "items-center px-3"
                    }`}
            >
                <Link
                    href="/roles"
                    className="flex items-center gap-2.5 overflow-hidden font-semibold text-foreground"
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground shadow-sm">
                        TH
                    </span>
                    {!collapsed && <span className="animate-fade">TechHire</span>}
                </Link>
                <button
                    onClick={toggleCollapsed}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={collapsed ? "Expand" : "Collapse"}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground ${collapsed ? "" : "ml-auto"
                        }`}
                >
                    <span
                        className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                    >
                        <Icon name="chevron" />
                    </span>
                </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV_ITEMS.map((item, i) => (
                    <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        collapsed={collapsed}
                        style={{ animationDelay: `${i * 55}ms` }}
                    />
                ))}
            </nav>

            <div className="border-t border-border px-3 py-3">
                <div
                    className={`flex items-center py-1.5 ${collapsed ? "justify-center px-0" : "gap-2 px-3"
                        }`}
                >
                    <Avatar name={userName} size="sm" />
                    {!collapsed && (
                        <p className="animate-fade truncate text-xs text-muted-foreground">{userName}</p>
                    )}
                </div>
                <NavLink
                    href="/profile"
                    label="Profile"
                    icon="profile"
                    active={pathname === "/profile"}
                    collapsed={collapsed}
                />
                <NavLink
                    href="/settings"
                    label="Settings"
                    icon="settings"
                    active={pathname === "/settings"}
                    collapsed={collapsed}
                />
                <button
                    onClick={handleSignOut}
                    title={collapsed ? "Sign out" : undefined}
                    className={`mt-1 flex w-full items-center rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${collapsed ? "justify-center px-2" : "gap-3 px-3"
                        }`}
                >
                    <Icon name="signout" />
                    {!collapsed && <span className="animate-fade">Sign out</span>}
                </button>
            </div>
        </aside>
    );
}
