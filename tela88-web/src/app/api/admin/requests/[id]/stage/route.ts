import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { updateRequestStage } from "@/lib/crm-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | { status?: "agendado" | "atendido" | "cliente" }
    | null;

  if (!payload?.status) {
    return NextResponse.json({ error: "Estado invalido." }, { status: 400 });
  }

  try {
    const saved = await updateRequestStage({
      id,
      status: payload.status,
    });

    return NextResponse.json({ success: true, request: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
