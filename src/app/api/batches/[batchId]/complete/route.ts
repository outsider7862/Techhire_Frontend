import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/batches/:batchId/complete
 * FastAPI calls this once after the last candidate in the batch finishes
 * (success or failure) — not required for correctness (the GET endpoint's
 * scored+failed===total check is), but lets the UI flip from a progress
 * bar to a "done" state without one extra poll's delay.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params;

  await prisma.batch.update({
    where: { id: batchId },
    data: { status: "complete" },
  });

  return NextResponse.json({ ok: true });
}
