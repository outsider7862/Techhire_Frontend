"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ConfirmOptions = {
    title: string;
    body?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
};

const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(
    null
);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
    return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<
        (ConfirmOptions & { resolve: (v: boolean) => void }) | null
    >(null);

    const confirm = useCallback(
        (opts: ConfirmOptions) =>
            new Promise<boolean>((resolve) => setState({ ...opts, resolve })),
        []
    );

    const close = useCallback(
        (value: boolean) => {
            setState((s) => {
                s?.resolve(value);
                return null;
            });
        },
        []
    );

    useEffect(() => {
        if (!state) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [state, close]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && (
                <div
                    className="animate-fade fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4"
                    onClick={() => close(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="animate-rise w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-foreground">{state.title}</h2>
                        {state.body && (
                            <p className="mt-2 text-sm text-muted-foreground">{state.body}</p>
                        )}
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => close(false)}
                                className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                            >
                                {state.cancelText ?? "Cancel"}
                            </button>
                            <button
                                onClick={() => close(true)}
                                autoFocus
                                className={`rounded-md px-4 py-2 text-sm font-medium ${state.destructive
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    }`}
                            >
                                {state.confirmText ?? "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
