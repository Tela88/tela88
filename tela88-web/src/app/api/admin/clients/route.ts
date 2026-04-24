import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { createManualClient } from "@/lib/crm-store";
import type { ClientStage, ServiceId, ServiceStageMap } from "@/lib/crm-types";

export async function POST(request: Request) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const payload = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        company?: string;
        revenue?: string;
        challenge?: string;
        focusArea?: string;
        clientStage?: ClientStage;
        packName?: string;
        packDescription?: string;
        setupFee?: string;
        monthlyFee?: string;
        notes?: string;
        scheduledAt?: string | null;
        services?: ServiceId[];
        serviceStages?: ServiceStageMap;
      }
    | null;

  if (!payload?.name?.trim() || !payload.email?.trim() || !payload.packName?.trim()) {
    return NextResponse.json(
      { error: "Preenche nome, email e nome do pack." },
      { status: 400 },
    );
  }

  try {
    const client = await createManualClient({
      name: payload.name.trim(),
      email: payload.email.trim(),
      company: payload.company?.trim() ?? "",
      revenue: payload.revenue?.trim() ?? "",
      challenge: payload.challenge?.trim() ?? "",
      focusArea: payload.focusArea?.trim() ?? "visibilidade",
      clientStage: payload.clientStage ?? "em-processo",
      packName: payload.packName.trim(),
      packDescription: payload.packDescription?.trim() ?? "",
      setupFee: payload.setupFee?.trim() ?? "",
      monthlyFee: payload.monthlyFee?.trim() ?? "",
      notes: payload.notes?.trim() ?? "",
      scheduledAt: payload.scheduledAt ?? null,
      services: payload.services ?? [],
      serviceStages: payload.serviceStages ?? {},
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
