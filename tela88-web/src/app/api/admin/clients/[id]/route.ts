import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { updateClient } from "@/lib/crm-store";
import type { ClientStage, ServiceDeliveryStage, ServiceId } from "@/lib/crm-types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | {
        packName?: string;
        packDescription?: string;
        setupFee?: string;
        monthlyFee?: string;
        services?: ServiceId[];
        serviceStages?: Record<ServiceId, ServiceDeliveryStage | undefined>;
        clientStage?: ClientStage;
        notes?: string;
        scheduledAt?: string | null;
      }
    | null;

  if (!payload || !payload.packName?.trim()) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  try {
    const client = await updateClient({
      id,
      packName: payload.packName.trim(),
      packDescription: payload.packDescription?.trim() ?? "",
      setupFee: payload.setupFee?.trim() ?? "",
      monthlyFee: payload.monthlyFee?.trim() ?? "",
      services: payload.services ?? [],
      serviceStages: payload.serviceStages ?? {},
      clientStage: payload.clientStage ?? "em-processo",
      notes: payload.notes?.trim() ?? "",
      scheduledAt: payload.scheduledAt ?? null,
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
