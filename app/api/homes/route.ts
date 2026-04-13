import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createHomeSchema } from "@/lib/validators/home";

export async function POST(request: NextRequest) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const parsed = createHomeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const home = await prisma.home.create({
    data: {
      name: parsed.data.name,
      users: {
        connect: {
          id: authResult.session.user.id
        }
      }
    }
  });

  await prisma.user.update({
    where: { id: authResult.session.user.id },
    data: { homeId: home.id, role: Role.OWNER }
  });

  return NextResponse.json(home, { status: 201 });
}
