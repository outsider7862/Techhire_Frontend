"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastApi = {
    success: (m: string) => void;
    error: (m: string) => void;
    info: (m: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
    return ctx; // stable reference — safe in effect/callback deps
}

const ACCENT: Record<ToastKind, string> = {
    success: "border-l-emerald-500",
    error: "border-l-destructive",
    info: "border-l-accent",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const show = useCallback((kind: ToastKind, message: string) => {
        const id = ++idRef.current;
        setToasts((t) => [...t, { id, kind, message }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
    }, []);

    const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

    const api = useMemo<ToastApi>(
        () => ({
            success: (m) => show("success", m),
            error: (m) => show("error", m),
            info: (m) => show("info", m),
        }),
        [show]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role="status"
                        className={`animate-rise pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 border-border bg-card p-3 pr-2 shadow-lg ${ACCENT[t.kind]}`}
                    >
                        <p className="flex-1 py-0.5 text-sm text-foreground">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            aria-label="Dismiss"
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
