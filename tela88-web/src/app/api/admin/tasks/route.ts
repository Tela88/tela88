import { NextResponse } from "next/server";
import { assertAdminActionRequest } from "@/lib/auth";
import { createTask } from "@/lib/crm-store";
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

export async function POST(request: Request) {
  const { errorResponse } = await assertAdminActionRequest(request);
  if (errorResponse) return errorResponse;

  const payload = (await request.json().catch(() => null)) as
    | {
        title?: string;
        description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      priorityMarginDays?: number | null;
      assigneeId?: string;
      dueDate?: string | null;
      clientId?: string | null;
      serviceId?: ServiceId | null;
      subServiceId?: string | null;
    }
    | null;

  if (!payload?.title?.trim() || !payload.assigneeId) {
    return NextResponse.json({ error: "Preenche titulo e responsavel." }, { status: 400 });
  }

  if (isPastDueDate(payload?.dueDate)) {
    return NextResponse.json({ error: "O prazo tem de ser hoje ou uma data futura." }, { status: 400 });
  }

  try {
    const task = await createTask({
      title: payload.title.trim(),
      description: payload.description?.trim() || "",
      status: "planeamento",
      priority: payload.priority ?? "media",
      priorityMarginDays: payload.priorityMarginDays ?? null,
      assigneeId: payload.assigneeId,
      dueDate: payload.dueDate ?? null,
      clientId: payload.clientId ?? null,
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
