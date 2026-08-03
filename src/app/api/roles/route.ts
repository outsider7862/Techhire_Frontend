import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";

export async function GET() {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const roles = await prisma.role.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const body = await req.json();
  const { title, description, requiredSkills, minYearsExperience } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const role = await prisma.role.create({
    data: {
      teamId,
      title,
      description: description ?? "",
      requiredSkills: requiredSkills ?? [],
      minYearsExperience: minYearsExperience ?? 0,
    },
  });

  return NextResponse.json(role);
}
