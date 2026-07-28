import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-muted-foreground">
            {items.map((item, i) => (
                <span key={i} className="flex items-center">
                    {i > 0 && <span className="mx-2 text-border">/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-foreground">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}