import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createDeviceSchema } from "@/lib/validators/device";

export async function POST(request: NextRequest) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  if (authResult.session.user.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createDeviceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const device = await prisma.device.create({
    data: {
      roomId: parsed.data.roomId,
      name: parsed.data.name,
      type: parsed.data.type,
      switches: {
        create: parsed.data.switches
      }
    },
    include: {
      switches: true
    }
  });

  return NextResponse.json(device, { status: 201 });
}
