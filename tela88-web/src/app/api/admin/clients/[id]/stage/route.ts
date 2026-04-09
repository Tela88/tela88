import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { updateClientStage } from "@/lib/crm-store";
import type { ClientStage } from "@/lib/crm-types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | { clientStage?: ClientStage }
    | null;

  if (!payload?.clientStage) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  try {
    const client = await updateClientStage({
      id,
      clientStage: payload.clientStage,
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
