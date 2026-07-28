import CalendarView from "./CalendarView";

export default function CalendarPage() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Calendar
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Schedule and track interviews and hiring events.
            </p>
            <div className="mt-8">
                <CalendarView />
            </div>
        </main>
    );
}