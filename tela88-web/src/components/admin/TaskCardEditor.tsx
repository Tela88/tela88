"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { getServiceLabel, taskPriorityLabels, taskStatusLabels } from "@/lib/service-catalog";
import type { ClientRecord, ServiceId, TaskPriority, TaskStatus, TeamMember, TeamTask } from "@/lib/crm-types";

export default function TaskCardEditor({
  task,
  teamMembers,
  clients,
  compact = false,
  initiallyCollapsed = false,
}: {
  task: TeamTask;
  teamMembers: TeamMember[];
  clients: ClientRecord[];
  compact?: boolean;
  initiallyCollapsed?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [serviceId, setServiceId] = useState<ServiceId | "">(task.serviceId ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const assignedMember = teamMembers.find((member) => member.id === assigneeId);
  const linkedClient = clients.find((client) => client.id === task.clientId);
  const availableServices = useMemo(
    () => linkedClient?.services ?? [],
    [linkedClient],
  );
  const compactMode = compact || collapsed;

  async function handleSave() {
    setSaving(true);

    const response = await fetch(`/api/admin/tasks/${task.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        priority,
        assigneeId,
        dueDate: dueDate || null,
        serviceId: serviceId || null,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm("Queres eliminar esta tarefa?");
    if (!confirmed) return;

    setDeleting(true);

    const response = await fetch(`/api/admin/tasks/${task.id}`, {
      method: "DELETE",
    });

    setDeleting(false);

    if (!response.ok) {
      return;
    }

    router.refresh();
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="w-full border border-outline-variant/12 bg-surface px-3 py-2 text-left transition-colors hover:border-primary-container"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-headline text-sm font-bold text-on-surface">{task.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-on-surface/55">
              <span>{assignedMember?.name ?? "Sem atribuicao"}</span>
              {task.dueDate ? <span>{task.dueDate}</span> : null}
            </div>
          </div>
          <span className="shrink-0 border border-outline-variant/20 px-2 py-1 font-label text-[8px] uppercase tracking-[0.16em] text-on-surface/55">
            Abrir
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className={`border border-outline-variant/12 bg-surface ${compactMode ? "p-3" : "p-4"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`font-headline font-bold text-on-surface ${compactMode ? "text-base" : "text-lg"}`}>{task.title}</p>
        <span className="border border-primary-container/20 px-2 py-1 font-label text-[10px] uppercase tracking-[0.16em] text-primary-container">
          {taskPriorityLabels[priority]}
        </span>
      </div>
      {!compactMode && task.description ? (
        <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/55">{task.description}</p>
      ) : null}
      <div className="mt-3 space-y-1">
        <p className="font-body text-xs text-on-surface/45">
          Responsavel: <span className="text-on-surface/70">{assignedMember?.name ?? "Sem atribuicao"}</span>
        </p>
        {task.dueDate ? (
          <p className="font-body text-xs text-on-surface/45">
            Prazo: <span className="text-on-surface/70">{task.dueDate}</span>
          </p>
        ) : null}
        {linkedClient ? (
          <p className="font-body text-xs text-on-surface/45">
            Cliente:{" "}
            <Link href={`/area-reservada/clientes/${linkedClient.id}`} className="text-primary-container">
              {linkedClient.company || linkedClient.name}
            </Link>
          </p>
        ) : null}
        {task.serviceId ? (
          <p className="font-body text-xs text-on-surface/45">
            Servico: <span className="text-on-surface/70">{getServiceLabel(task.serviceId)}</span>
          </p>
        ) : null}
      </div>

      <div className={`mt-4 grid ${compactMode ? "gap-2" : "gap-3"}`}>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className={`w-full border border-outline-variant/20 bg-surface-container-low font-body text-on-surface outline-none focus:border-primary-container ${compactMode ? "px-2 py-2 text-xs" : "px-3 py-2 text-sm"}`}
        >
          {Object.entries(taskStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
          className={`w-full border border-outline-variant/20 bg-surface-container-low font-body text-on-surface outline-none focus:border-primary-container ${compactMode ? "px-2 py-2 text-xs" : "px-3 py-2 text-sm"}`}
        >
          {Object.entries(taskPriorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          className={`w-full border border-outline-variant/20 bg-surface-container-low font-body text-on-surface outline-none focus:border-primary-container ${compactMode ? "px-2 py-2 text-xs" : "px-3 py-2 text-sm"}`}
        >
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className={`w-full border border-outline-variant/20 bg-surface-container-low font-body text-on-surface outline-none focus:border-primary-container ${compactMode ? "px-2 py-2 text-xs" : "px-3 py-2 text-sm"}`}
        />

        {linkedClient ? (
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value as ServiceId | "")}
            className={`w-full border border-outline-variant/20 bg-surface-container-low font-body text-on-surface outline-none focus:border-primary-container ${compactMode ? "px-2 py-2 text-xs" : "px-3 py-2 text-sm"}`}
          >
            <option value="">Sem servico associado</option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {getServiceLabel(service.id)}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${compactMode ? "gap-2" : ""}`}>
        {initiallyCollapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            disabled={saving || deleting}
            className={`border border-outline-variant/20 bg-surface-container-low font-label uppercase tracking-[0.18em] text-on-surface/70 disabled:cursor-not-allowed disabled:opacity-40 ${compactMode ? "px-3 py-2 text-[9px]" : "px-4 py-3 text-[10px]"}`}
          >
            Fechar
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className={`border border-error/25 bg-surface-container-low font-label uppercase tracking-[0.18em] text-error disabled:cursor-not-allowed disabled:opacity-40 ${compactMode ? "px-3 py-2 text-[9px]" : "px-4 py-3 text-[10px]"}`}
        >
          {deleting ? "A eliminar..." : "Eliminar"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || deleting}
          className={`bg-primary-container font-headline font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40 ${compactMode ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"}`}
        >
          {saving ? "A guardar..." : "Guardar tarefa"}
        </button>
      </div>
    </div>
  );
}
