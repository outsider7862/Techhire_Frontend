import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSignedReadUrl } from "@/lib/storage";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    const { error } = await requireAuth();
    if (error) return error;

    const { candidateId } = await params;
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
        return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const url = await createSignedReadUrl(candidate.fileUrl, 300);
    return NextResponse.json({ url });
}
