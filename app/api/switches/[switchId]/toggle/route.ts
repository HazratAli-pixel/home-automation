import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api";
import { toggleSwitch } from "@/lib/services/device-manager.service";

export async function POST(_request: Request, context: { params: Promise<{ switchId: string }> }) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  try {
    const { switchId } = await context.params;
    const sw = await toggleSwitch({
      switchId,
      userId: authResult.session.user.id,
      role: authResult.session.user.role
    });
    return NextResponse.json(sw);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
