import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";
import { getRoleForTeam } from "@/lib/teamScoped";
import { scoreOne } from "@/lib/parsingService";
import { enforceRateLimit } from "@/lib/rateLimit";
import { logActivity } from "@/lib/activity";

/**
 * Re-scores every already-scored candidate on a role against its current
 * requirements — used after the role's skills, minimum experience, or scoring
 * emphasis change. Reuses each candidate's stored parsed profile, so there's
 * no re-parsing or file fetch, just a fresh scoring call per candidate.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { user, teamId, error } = await requireTeam();
  if (error) return error;

  const { roleId } = await params;
  const { role, error: roleError } = await getRoleForTeam(roleId, teamId);
  if (roleError) return roleError;

  // Each re-score fans out one OpenAI call per candidate — cap how often a
  // team can trigger it so an edit-happy user can't run up the bill.
  const limited = await enforceRateLimit(teamId, "rescore-role", 10, 60 * 60 * 1000);
  if (limited) return limited;

  const candidates = await prisma.candidate.findMany({
    where: { roleId, status: "SCORED" },
  });

  const roleRequirements = {
    title: role.title,
    required_skills: role.requiredSkills,
    min_years_experience: role.minYearsExperience,
    description: role.description,
    skills_weight: role.skillsWeight,
  };

  const actor = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { name: true },
  });
  const actorName = actor?.name ?? "Someone";

  let rescored = 0;
  for (const c of candidates) {
    try {
      const before = c.score;
      const result = await scoreOne({
        parsed: {
          name: c.name ?? "",
          email: c.email ?? "",
          phone: c.phone ?? "",
          skills: c.skills,
          years_experience: c.yearsExperience ?? 0,
          tech_stack: c.techStack,
          summary: c.summary ?? "",
        },
        role: roleRequirements,
      });

      await prisma.candidate.update({
        where: { id: c.id },
        data: {
          score: result.score,
          scoreReasoning: result.reasoning,
          scoredAt: new Date(),
        },
      });

      const delta =
        before === null ? "" : ` (was ${before}, now ${result.score})`;
      await logActivity(
        teamId,
        c.id,
        actorName,
        `re-scored after role requirements changed${delta}`
      );
      rescored++;
    } catch {
      // Skip individual failures — one bad candidate shouldn't abort the rest.
    }
  }

  return NextResponse.json({ rescored, total: candidates.length });
}
