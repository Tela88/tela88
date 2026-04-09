import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { confirmConsultationRequest } from "@/lib/crm-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | { scheduledAt?: string; notes?: string }
    | null;

  if (!payload?.scheduledAt) {
    return NextResponse.json({ error: "Escolhe uma data e hora." }, { status: 400 });
  }

  try {
    const saved = await confirmConsultationRequest(id, payload.scheduledAt, payload.notes?.trim() ?? "");
    return NextResponse.json({ success: true, request: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
