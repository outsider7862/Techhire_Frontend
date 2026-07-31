import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { name } = await req.json();
    if (!name || !name.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const profile = await prisma.profile.update({
        where: { id: user.id },
        data: { name: name.trim() },
    });
    return NextResponse.json(profile);
}

export async function DELETE() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Profile row is deleted automatically via the auth.users FK cascade
    // set up in Part E — no separate Prisma delete needed.
    return NextResponse.json({ ok: true });
}
