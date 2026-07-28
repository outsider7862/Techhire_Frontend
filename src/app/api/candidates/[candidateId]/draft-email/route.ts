import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCandidateDisplayName } from "@/lib/displayName";

const PARSING_SERVICE_URL = process.env.PARSING_SERVICE_URL!;
const PARSING_SERVICE_TOKEN = process.env.PARSING_SERVICE_TOKEN!;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    const { candidateId } = await params;
    const { emailType, instruction, previousDraft } = await req.json();

    const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { role: true },
    });

    if (!candidate) {
        return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

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
            candidate_name: guessNameFromFileName(candidate.fileName),
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