import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { updateTask } from "@/lib/crm-store";
import type { TaskPriority, TaskStatus } from "@/lib/crm-types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | {
        status?: TaskStatus;
        priority?: TaskPriority;
        assigneeId?: string;
        dueDate?: string | null;
      }
    | null;

  if (!payload?.status || !payload.priority || !payload.assigneeId) {
    return NextResponse.json({ error: "Preenche estado, prioridade e responsável." }, { status: 400 });
  }

  try {
    const task = await updateTask({
      id,
      status: payload.status,
      priority: payload.priority,
      assigneeId: payload.assigneeId,
      dueDate: payload.dueDate ?? null,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
