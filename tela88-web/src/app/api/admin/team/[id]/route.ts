import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { deleteTeamMember, updateTeamMember } from "@/lib/crm-store";
import type { TeamMemberStatus } from "@/lib/crm-types";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;
  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Apenas admins podem editar colaboradores." }, { status: 403 });
  }

  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | {
        name?: string;
        username?: string;
        email?: string;
        password?: string;
        role?: string;
        status?: TeamMemberStatus;
        dailyCapacity?: string;
      }
    | null;

  if (!payload?.name?.trim() || !payload.username?.trim() || !payload.email?.trim() || !payload.role?.trim()) {
    return NextResponse.json({ error: "Preenche os campos principais do colaborador." }, { status: 400 });
  }

  try {
    const member = await updateTeamMember({
      id,
      name: payload.name.trim(),
      username: payload.username.trim(),
      email: payload.email.trim(),
      password: payload.password?.trim(),
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;
  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Apenas admins podem eliminar colaboradores." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const result = await deleteTeamMember(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
