import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { createService } from "@/lib/crm-store";

export async function POST(request: Request) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;
  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Apenas admins podem registar servicos." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        label?: string;
        summary?: string;
      }
    | null;

  if (!payload?.label?.trim()) {
    return NextResponse.json({ error: "Preenche o nome do servico." }, { status: 400 });
  }

  try {
    const service = await createService({
      label: payload.label.trim(),
      summary: payload.summary?.trim() || "",
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
