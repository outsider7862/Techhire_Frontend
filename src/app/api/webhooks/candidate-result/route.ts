import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyParsingServiceToken } from "@/lib/auth";

/**
 * POST /api/webhooks/candidate-result
 * FastAPI posts here once per resume, as soon as that individual result
 * is ready — not batched at the end. This is what lets the recruiter see
 * candidates populate the ranked list progressively instead of everything
 * appearing at once after the whole batch finishes.
 *
 * A failure on one resume (corrupt file, unreadable scan) is expected and
 * handled here rather than treated as an error — see status: "failed".
 */
export async function POST(req: NextRequest) {
  const authError = verifyParsingServiceToken(req);
  if (authError) return authError;

  const body = await req.json();
  const { candidate_id, status, parsed, score, error } = body;

  if (status === "scored") {
    await prisma.candidate.update({
      where: { id: candidate_id },
      data: {
        status: "SCORED",
        skills: parsed.skills,
        techStack: parsed.tech_stack,
        yearsExperience: parsed.years_experience,
        summary: parsed.summary,
        score: score.score,
        scoreReasoning: score.reasoning,
      },
    });
  } else {
    await prisma.candidate.update({
      where: { id: candidate_id },
      data: {
        status: "FAILED",
        errorMessage: error ?? "Unknown parsing error",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
