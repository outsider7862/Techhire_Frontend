import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";

const VALID_STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "HIRED",
] as const;

export async function GET(req: NextRequest) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const minYears = searchParams.get("minYears");
  const roleId = searchParams.get("roleId");
  const stageParam = searchParams.get("stage");
  const stage = VALID_STAGES.find((s) => s === stageParam);

  const candidates = await prisma.candidate.findMany({
    where: {
      status: "SCORED",
      role: { teamId },
      ...(roleId ? { roleId } : {}),
      ...(stage ? { stage } : {}),
      ...(minYears ? { yearsExperience: { gte: Number(minYears) } } : {}),
    },
    include: { role: { select: { title: true } } },
    orderBy: { score: "desc" },
  });

  const filtered = q
    ? candidates.filter((c) => {
        const haystack = [c.fileName, c.name ?? "", c.summary ?? "", ...c.skills, ...c.techStack]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
    : candidates;

  return NextResponse.json(filtered);
}
