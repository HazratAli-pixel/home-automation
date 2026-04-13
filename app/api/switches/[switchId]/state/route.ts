import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ switchId: string }> }) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { switchId } = await context.params;
  const sw = await prisma.switch.findUnique({
    where: { id: switchId },
    select: { id: true, state: true, name: true }
  });

  if (!sw) {
    return NextResponse.json({ error: "Switch not found" }, { status: 404 });
  }

  return NextResponse.json(sw);
}
