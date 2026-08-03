import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";
import { getRoleForTeam } from "@/lib/teamScoped";
import { getCandidateDisplayName } from "@/lib/displayName";

const PARSING_SERVICE_URL = process.env.PARSING_SERVICE_URL!;
const PARSING_SERVICE_TOKEN = process.env.PARSING_SERVICE_TOKEN!;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { roleId } = await params;
  const { role, error: roleError } = await getRoleForTeam(roleId, teamId);
  if (roleError) return roleError;

  const candidates = await prisma.candidate.findMany({
    where: { roleId, status: "SCORED" },
  });

  if (candidates.length < 2) {
    return NextResponse.json(
      { error: "Need at least 2 scored candidates to compare" },
      { status: 400 }
    );
  }

  const res = await fetch(`${PARSING_SERVICE_URL}/explain-leaderboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PARSING_SERVICE_TOKEN}`,
    },
    body: JSON.stringify({
      role: {
        title: role.title,
        required_skills: role.requiredSkills,
        min_years_experience: role.minYearsExperience,
        description: role.description,
      },
      candidates: candidates.map((c) => ({
        candidate_id: c.id,
        name: getCandidateDisplayName(c),
        summary: c.summary ?? "",
        skills: c.skills,
        score: c.score ?? 0,
        reasoning: c.scoreReasoning ?? "",
      })),
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to generate comparison" }, { status: 502 });
  }

  return NextResponse.json(await res.json());
}
