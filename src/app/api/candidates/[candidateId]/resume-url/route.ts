import { NextRequest, NextResponse } from "next/server";
import { createSignedReadUrl } from "@/lib/storage";
import { requireTeam } from "@/lib/requireTeam";
import { getCandidateForTeam } from "@/lib/teamScoped";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    const { teamId, error } = await requireTeam();
    if (error) return error;

    const { candidateId } = await params;
    const { candidate, error: candErr } = await getCandidateForTeam(candidateId, teamId);
    if (candErr) return candErr;

    const url = await createSignedReadUrl(candidate.fileUrl, 300);
    return NextResponse.json({ url });
}
