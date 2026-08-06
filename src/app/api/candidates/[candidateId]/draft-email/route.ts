import { NextRequest, NextResponse } from "next/server";
import { getCandidateDisplayName } from "@/lib/displayName";
import { requireTeam } from "@/lib/requireTeam";
import { getCandidateForTeam } from "@/lib/teamScoped";
import { enforceRateLimit } from "@/lib/rateLimit";

const PARSING_SERVICE_URL = process.env.PARSING_SERVICE_URL!;
const PARSING_SERVICE_TOKEN = process.env.PARSING_SERVICE_TOKEN!;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    const { teamId, error } = await requireTeam();
    if (error) return error;

    const { candidateId } = await params;
    const { candidate, error: candErr } = await getCandidateForTeam(candidateId, teamId);
    if (candErr) return candErr;

    // 40 email drafts per team per hour.
    const limited = await enforceRateLimit(teamId, "draft-email", 40, 60 * 60 * 1000);
    if (limited) return limited;

    const { emailType, instruction, previousDraft } = await req.json();

    const res = await fetch(`${PARSING_SERVICE_URL}/draft-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PARSING_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
            role: {
                title: candidate.role.title,
                required_skills: candidate.role.requiredSkills,
                min_years_experience: candidate.role.minYearsExperience,
                description: candidate.role.description,
            },
            candidate_name: getCandidateDisplayName(candidate),
            candidate_summary: candidate.summary ?? "",
            candidate_skills: candidate.skills,
            email_type: emailType,
            instruction: instruction ?? null,
            previous_draft: previousDraft ?? null,
        }),
    });

    if (!res.ok) {
        return NextResponse.json({ error: "Failed to draft email" }, { status: 502 });
    }

    return NextResponse.json(await res.json());
}
