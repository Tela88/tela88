"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TaskCardEditor from "@/components/admin/TaskCardEditor";
import { taskStatusLabels } from "@/lib/service-catalog";
import type { ClientRecord, TeamMember, TeamTask } from "@/lib/crm-types";

type DragPayload = { type: "task"; id: string };

export default function ClientTaskBoard({
  clientId,
  tasks,
  teamMembers,
  clients,
}: {
  clientId: string;
  tasks: TeamTask[];
  teamMembers: TeamMember[];
  clients: ClientRecord[];
}) {
  const router = useRouter();
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  const tasksByStatus = {
    hoje: tasks.filter((task) => task.status === "hoje"),
    "em-curso": tasks.filter((task) => task.status === "em-curso"),
    "em-revisao": tasks.filter((task) => task.status === "em-revisao"),
    feito: tasks.filter((task) => task.status === "feito"),
  };

  function dragStart(taskId: string) {
    return (event: React.DragEvent<HTMLDivElement>) => {
      const payload: DragPayload = { type: "task", id: taskId };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/json", JSON.stringify(payload));
    };
  }

  function parsePayload(event: React.DragEvent<HTMLDivElement>) {
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Partial<DragPayload>;
    } catch {
      return null;
    }
  }

  function handleDragOver(zoneId: string) {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setActiveDropZone(zoneId);
    };
  }

  function handleDragLeave(zoneId: string) {
    return () => {
      if (activeDropZone === zoneId) {
        setActiveDropZone(null);
      }
    };
  }

  function handleDrop(targetStatus: TeamTask["status"], zoneId: string) {
    return async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parsePayload(event);
      if (payload?.type !== "task" || !payload.id) return;
      const task = tasks.find((item) => item.id === payload.id && item.clientId === clientId);
      if (!task) return;

      setActiveDropZone(zoneId);
      const response = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: targetStatus,
          priority: task.priority,
          assigneeId: task.assigneeId,
          dueDate: task.dueDate,
        }),
      });

      setActiveDropZone(null);

      if (!response.ok) {
        return;
      }

      router.refresh();
    };
  }

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {(Object.keys(tasksByStatus) as Array<keyof typeof tasksByStatus>).map((statusKey) => {
        const zoneId = `client-task-${statusKey}`;

        return (
          <div
            key={statusKey}
            onDragOver={handleDragOver(zoneId)}
            onDragLeave={handleDragLeave(zoneId)}
            onDrop={handleDrop(statusKey, zoneId)}
            className={`border bg-surface-container-low p-4 transition-colors ${
              activeDropZone === zoneId ? "border-primary-container" : "border-outline-variant/15"
            }`}
          >
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
              <p className="font-headline text-xl font-bold text-on-surface">{taskStatusLabels[statusKey]}</p>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                {String(tasksByStatus[statusKey].length).padStart(2, "0")}
              </span>
            </div>

            <div className="space-y-3">
              {tasksByStatus[statusKey].length === 0 ? (
                <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                  <p className="font-body text-xs text-on-surface/45">Larga aqui uma tarefa.</p>
                </div>
              ) : (
                tasksByStatus[statusKey].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={dragStart(task.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCardEditor task={task} teamMembers={teamMembers} clients={clients} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
