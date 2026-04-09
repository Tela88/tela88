import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { convertRequestToClient } from "@/lib/crm-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  await request.json().catch(() => null);

  try {
    const client = await convertRequestToClient({
      requestId: id,
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
