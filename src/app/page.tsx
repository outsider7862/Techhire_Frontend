import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const FEATURES = [
    {
        title: "Score & rank",
        body: "Every resume read and scored against your role, then ranked so the strongest rise to the top.",
        icon: (
            <>
                <path d="M3 3v18h18" />
                <path d="M7 16v-5M12 16V8M17 16v-3" />
            </>
        ),
    },
    {
        title: "Track the pipeline",
        body: "Move candidates through applied → interview → offer on a board built for hiring, not tickets.",
        icon: (
            <>
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
            </>
        ),
    },
    {
        title: "Draft & schedule",
        body: "Generate outreach in a click and find interview slots that don't clash — without leaving the app.",
        icon: (
            <>
                <path d="M8 2v4M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
            </>
        ),
    },
];

export default async function HomePage() {
    // Send signed-in recruiters straight to their workspace.
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/roles");

    return (
        <main className="animate-rise mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
            <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground shadow-sm">
                    TH
                </span>
                <span className="text-lg font-semibold text-foreground">TechHire Copilot</span>
            </div>

            <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                Hire technical talent,{" "}
                <span className="text-accent">without the resume pile.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
                TechHire Copilot reads every resume, scores and ranks candidates against your
                role, drafts outreach, and schedules interviews — so your team spends its time on
                the best few, not the stack.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                    href="/signup"
                    className="hover-lift rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90"
                >
                    Start hiring
                </Link>
                <Link
                    href="/login"
                    className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                    Sign in
                </Link>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-3">
                {FEATURES.map((f, i) => (
                    <div
                        key={f.title}
                        style={{ animationDelay: `${150 + i * 90}ms` }}
                        className="animate-rise hover-lift rounded-lg border border-border bg-card p-4"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                {f.icon}
                            </svg>
                        </span>
                        <p className="mt-3 font-medium text-foreground">{f.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}
