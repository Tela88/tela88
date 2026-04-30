import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { deleteTask, updateTask } from "@/lib/crm-store";
import type { ServiceId, TaskPriority, TaskStatus } from "@/lib/crm-types";

function isPastDueDate(value: string | null | undefined) {
  if (!value) return false;

  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return false;
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return datePart < today;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | {
        status?: TaskStatus;
        priority?: TaskPriority;
        priorityMarginDays?: number | null;
        assigneeId?: string;
        dueDate?: string | null;
        serviceId?: ServiceId | null;
        subServiceId?: string | null;
      }
    | null;

  if (!payload?.status) {
    return NextResponse.json({ error: "Preenche o estado da tarefa." }, { status: 400 });
  }

  if (isPastDueDate(payload?.dueDate)) {
    return NextResponse.json({ error: "O prazo tem de ser hoje ou uma data futura." }, { status: 400 });
  }

  try {
    const task = await updateTask({
      id,
      status: payload.status,
      priority: payload.priority ?? "media",
      priorityMarginDays: admin.role === "admin" ? (payload.priorityMarginDays ?? null) : undefined,
      assigneeId: payload.assigneeId ?? "",
      dueDate: payload.dueDate ?? null,
      serviceId: payload.serviceId ?? null,
      subServiceId: payload.subServiceId ?? null,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { admin, errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;
  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Apenas admins podem eliminar tarefas." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
