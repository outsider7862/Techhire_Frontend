import Link from "next/link";

export default function NotFound() {
    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
            <p className="font-mono text-sm text-muted-foreground">404</p>
            <h1 className="mt-2 text-xl font-semibold text-foreground">
                Page not found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
                The role or candidate you&apos;re looking for doesn&apos;t exist, or
                may have been deleted.
            </p>
            <Link
                href="/roles"
                className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Back to roles
            </Link>
        </main>
    );
}