import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { createTeamMember } from "@/lib/crm-store";
import type { TeamMemberStatus } from "@/lib/crm-types";

export async function POST(request: Request) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const payload = (await request.json().catch(() => null)) as
    | {
        name?: string;
        role?: string;
        status?: TeamMemberStatus;
        dailyCapacity?: string;
      }
    | null;

  if (!payload?.name?.trim() || !payload.role?.trim()) {
    return NextResponse.json({ error: "Preenche nome e funcao." }, { status: 400 });
  }

  try {
    const member = await createTeamMember({
      name: payload.name.trim(),
      role: payload.role.trim(),
      status: payload.status ?? "disponivel",
      dailyCapacity: payload.dailyCapacity?.trim() || "Sem capacidade definida",
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
