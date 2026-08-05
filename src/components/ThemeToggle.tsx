"use client";

import { useSyncExternalStore } from "react";

// The theme lives on <html>'s class list, set by ThemeScript before React
// hydrates. useSyncExternalStore reads that external (DOM) state safely: it
// renders getServerSnapshot() on the server and during hydration — matching
// SSR — then switches to the live DOM value, so there's no hydration
// mismatch and no setState-in-effect. Subscribing to a custom event (fired by
// toggle) plus the storage event also keeps multiple tabs in sync.
function subscribe(callback: () => void) {
    window.addEventListener("themechange", callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener("themechange", callback);
        window.removeEventListener("storage", callback);
    };
}

function getSnapshot() {
    return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
    return false;
}

export default function ThemeToggle() {
    const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    function toggle() {
        const next = !isDark;
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
        window.dispatchEvent(new Event("themechange"));
    }

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="hover-lift inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-accent/40 hover:bg-muted"
        >
            <span className="text-accent">
                {isDark ? (
                    // moon
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                ) : (
                    // sun
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                )}
            </span>
            {isDark ? "Dark mode" : "Light mode"}
        </button>
    );
}
