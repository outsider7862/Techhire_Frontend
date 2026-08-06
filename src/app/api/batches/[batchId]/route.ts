import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSignedReadUrl } from "@/lib/storage";
import { startBatch } from "@/lib/parsingService";
import { resolveIfStale } from "@/lib/staleBatches";
import { requireTeam } from "@/lib/requireTeam";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { batchId } = await params;
  await resolveIfStale(batchId);

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { candidates: { select: { status: true } }, role: true },
  });

  if (!batch || batch.role.teamId !== teamId) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const scored = batch.candidates.filter((c) => c.status === "SCORED").length;
  const failed = batch.candidates.filter((c) => c.status === "FAILED").length;

  return NextResponse.json({
    batchId: batch.id,
    total: batch.total,
    scored,
    failed,
    pending: batch.total - scored - failed,
    status: batch.status,
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { batchId } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { role: true, candidates: true },
  });

  if (!batch || batch.role.teamId !== teamId) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const candidatesWithReadUrls = await Promise.all(
    batch.candidates.map(async (c) => ({
      candidate_id: c.id,
      file_url: await createSignedReadUrl(c.fileUrl),
      file_name: c.fileName,
    }))
  );

  const baseUrl = process.env.PUBLIC_APP_URL!;

  await startBatch({
    batchId: batch.id,
    role: {
      title: batch.role.title,
      required_skills: batch.role.requiredSkills,
      min_years_experience: batch.role.minYearsExperience,
      description: batch.role.description,
      skills_weight: batch.role.skillsWeight,
    },
    candidates: candidatesWithReadUrls,
    callbackUrl: `${baseUrl}/api/webhooks/candidate-result`,
    batchCompleteUrl: `${baseUrl}/api/batches/${batch.id}/complete`,
  });

  return NextResponse.json({ batchId: batch.id, status: "processing" });
}
