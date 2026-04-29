"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TaskCardEditor from "@/components/admin/TaskCardEditor";
import { taskStatusLabels } from "@/lib/service-catalog";
import type { AuthenticatedUser, ClientRecord, ServiceDefinition, ServiceSubservice, TeamMember, TeamTask } from "@/lib/crm-types";

type DragPayload = { type: "task"; id: string };

const taskPriorityOrder: Record<TeamTask["priority"], number> = {
  alta: 0,
  media: 1,
  baixa: 2,
};

function sortTasksByPriority(items: TeamTask[]) {
  return [...items].sort((left, right) => {
    const priorityDelta = taskPriorityOrder[left.priority] - taskPriorityOrder[right.priority];
    if (priorityDelta !== 0) return priorityDelta;

    const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return leftDate - rightDate;
  });
}

export default function ClientTaskBoard({
  clientId,
  tasks,
  teamMembers,
  clients,
  services,
  subservices,
  currentUser,
}: {
  clientId: string;
  tasks: TeamTask[];
  teamMembers: TeamMember[];
  clients: ClientRecord[];
  services: ServiceDefinition[];
  subservices: ServiceSubservice[];
  currentUser: AuthenticatedUser;
}) {
  const router = useRouter();
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  const tasksByStatus = {
    hoje: sortTasksByPriority(tasks.filter((task) => task.status === "hoje")),
    planeamento: sortTasksByPriority(tasks.filter((task) => task.status === "planeamento")),
    "em-producao": sortTasksByPriority(tasks.filter((task) => task.status === "em-producao")),
    "em-revisao": sortTasksByPriority(tasks.filter((task) => task.status === "em-revisao")),
    feito: sortTasksByPriority(tasks.filter((task) => task.status === "feito")),
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
        body: JSON.stringify(
          currentUser.role === "admin"
            ? {
                status: targetStatus,
                priority: task.priority,
                assigneeId: task.assigneeId,
                dueDate: task.dueDate,
                serviceId: task.serviceId,
                subServiceId: task.subServiceId,
              }
            : {
                status: targetStatus,
              },
        ),
      });

      setActiveDropZone(null);

      if (!response.ok) {
        return;
      }

      router.refresh();
    };
  }

  return (
    <div className="grid gap-4 xl:grid-cols-5">
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

            <div className={statusKey === "feito" ? "space-y-2" : "space-y-3"}>
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
                    <TaskCardEditor
                      task={task}
                      teamMembers={teamMembers}
                      clients={clients}
                      services={services}
                      subservices={subservices}
                      currentUser={currentUser}
                      compact={statusKey === "feito"}
                    />
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
