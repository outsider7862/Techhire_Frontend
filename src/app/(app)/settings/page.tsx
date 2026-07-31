import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
    return (
        <main className="mx-auto max-w-lg px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">App-wide preferences.</p>

            <section className="mt-8 rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-medium text-muted-foreground">Appearance</h2>
                <div className="mt-3">
                    <ThemeToggle />
                </div>
            </section>
        </main>
    );
}
