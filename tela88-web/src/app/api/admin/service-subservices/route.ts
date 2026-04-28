import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { createServiceSubservice } from "@/lib/crm-store";
import type { ServiceId } from "@/lib/crm-types";

export async function POST(request: Request) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;
  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Apenas admins podem registar sub-servicos." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        serviceId?: ServiceId;
        name?: string;
        description?: string;
      }
    | null;

  if (!payload?.serviceId || !payload.name?.trim()) {
    return NextResponse.json({ error: "Preenche servico e nome do sub-servico." }, { status: 400 });
  }

  try {
    const subservice = await createServiceSubservice({
      serviceId: payload.serviceId,
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
    });

    return NextResponse.json({ success: true, subservice });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
