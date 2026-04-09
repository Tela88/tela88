import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { createTask } from "@/lib/crm-store";
import type { ServiceId, TaskPriority, TaskStatus } from "@/lib/crm-types";

export async function POST(request: Request) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const payload = (await request.json().catch(() => null)) as
    | {
        title?: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        assigneeId?: string;
        dueDate?: string | null;
        clientId?: string | null;
        serviceId?: ServiceId | null;
      }
    | null;

  if (!payload?.title?.trim() || !payload.assigneeId) {
    return NextResponse.json({ error: "Preenche titulo e responsavel." }, { status: 400 });
  }

  try {
    const task = await createTask({
      title: payload.title.trim(),
      description: payload.description?.trim() || "",
      status: payload.status ?? "hoje",
      priority: payload.priority ?? "media",
      assigneeId: payload.assigneeId,
      dueDate: payload.dueDate ?? null,
      clientId: payload.clientId ?? null,
      serviceId: payload.serviceId ?? null,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
