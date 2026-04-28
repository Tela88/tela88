import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { deleteServiceSubservice } from "@/lib/crm-store";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;
  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Apenas admins podem eliminar sub-servicos." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const result = await deleteServiceSubservice(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
