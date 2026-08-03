import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";
import { getRoleForTeam } from "@/lib/teamScoped";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { roleId } = await params;
  const { role, error: roleError } = await getRoleForTeam(roleId, teamId);
  if (roleError) return roleError;

  return NextResponse.json(role);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { roleId } = await params;
  const { error: roleError } = await getRoleForTeam(roleId, teamId);
  if (roleError) return roleError;

  const body = await req.json();
  const { title, description, requiredSkills, minYearsExperience } = body;

  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(requiredSkills !== undefined ? { requiredSkills } : {}),
      ...(minYearsExperience !== undefined ? { minYearsExperience } : {}),
    },
  });

  return NextResponse.json(role);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { roleId } = await params;
  const { error: roleError } = await getRoleForTeam(roleId, teamId);
  if (roleError) return roleError;

  await prisma.role.delete({ where: { id: roleId } });
  return NextResponse.json({ ok: true });
}
