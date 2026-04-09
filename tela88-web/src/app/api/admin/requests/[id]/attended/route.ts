import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { markMeetingAttended } from "@/lib/crm-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  await request.json().catch(() => null);

  try {
    const saved = await markMeetingAttended(id);
    return NextResponse.json({ success: true, request: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
