import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api";
import { turnOffAll } from "@/lib/services/device-manager.service";

const schema = z.object({ homeId: z.string().cuid() });

export async function POST(request: NextRequest) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await turnOffAll(
      parsed.data.homeId,
      authResult.session.user.id,
      authResult.session.user.role
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }
}
