import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createRoomSchema } from "@/lib/validators/room";

export async function POST(request: NextRequest) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  if (authResult.session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createRoomSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const room = await prisma.room.create({
    data: parsed.data
  });

  return NextResponse.json(room, { status: 201 });
}
