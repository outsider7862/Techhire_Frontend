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
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
        >
            {isDark ? "🌙 Dark mode" : "☀️ Light mode"}
            <span className="ml-1 text-xs text-muted-foreground">(click to toggle)</span>
        </button>
    );
}
