import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { createTeamMember } from "@/lib/crm-store";
import type { InternalUserRole, ServiceId, TeamMemberStatus } from "@/lib/crm-types";

export async function POST(request: Request) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;
  if (admin?.role !== "admin" && admin?.role !== "secretaria") {
    return NextResponse.json({ error: "Apenas admin e secretaria podem criar colaboradores." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        name?: string;
        username?: string;
        email?: string;
        password?: string;
        accessRole?: InternalUserRole;
        role?: string;
        serviceIds?: ServiceId[];
        status?: TeamMemberStatus;
        dailyCapacity?: string;
      }
    | null;

  if (!payload?.name?.trim() || !payload.role?.trim() || !payload.password?.trim()) {
    return NextResponse.json({ error: "Preenche nome, funcao e palavra-passe." }, { status: 400 });
  }

  try {
    const member = await createTeamMember({
      name: payload.name.trim(),
      username: payload.username?.trim(),
      email: payload.email?.trim(),
      password: payload.password.trim(),
      accessRole: payload.accessRole === "secretaria" ? "secretaria" : "collaborator",
      role: payload.role.trim(),
      serviceIds: payload.serviceIds ?? [],
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
