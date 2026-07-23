import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          TechHire Copilot
        </h1>
        <Link
          href="/roles/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New role
        </Link>
      </div>

      <div className="mt-10 divide-y divide-slate-200 border-t border-slate-200">
        {roles.length === 0 && (
          <p className="py-8 text-sm text-slate-500">
            No roles yet. Create one to start uploading resumes against it.
          </p>
        )}
        {roles.map((role) => (
          <Link
            key={role.id}
            href={`/roles/${role.id}`}
            className="flex items-center justify-between py-4 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-900">{role.title}</p>
              <p className="text-sm text-slate-500">
                {role.requiredSkills.slice(0, 4).join(", ")}
              </p>
            </div>
            <span className="text-sm text-slate-400">
              {role._count.candidates} candidate
              {role._count.candidates === 1 ? "" : "s"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
