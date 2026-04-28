import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { deleteTask, updateTask } from "@/lib/crm-store";
import type { ServiceId, TaskPriority, TaskStatus } from "@/lib/crm-types";

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

  try {
    const task =
      admin.role === "admin"
        ? await updateTask({
            id,
            status: payload.status,
            priority: payload.priority ?? "media",
            priorityMarginDays: payload.priorityMarginDays ?? null,
            assigneeId: payload.assigneeId ?? "",
            dueDate: payload.dueDate ?? null,
            serviceId: payload.serviceId ?? null,
            subServiceId: payload.subServiceId ?? null,
          })
        : await updateTask({
            id,
            status: payload.status,
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
