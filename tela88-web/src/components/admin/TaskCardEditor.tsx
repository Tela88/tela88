"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { getServiceLabel, taskPriorityLabels, taskStatusLabels } from "@/lib/service-catalog";
import type { ClientRecord, TaskPriority, TaskStatus, TeamMember, TeamTask } from "@/lib/crm-types";

export default function TaskCardEditor({
  task,
  teamMembers,
  clients,
}: {
  task: TeamTask;
  teamMembers: TeamMember[];
  clients: ClientRecord[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  const assignedMember = teamMembers.find((member) => member.id === assigneeId);
  const linkedClient = clients.find((client) => client.id === task.clientId);

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
      }),
    });

    setSaving(false);

    if (!response.ok) {
      return;
    }

    router.refresh();
  }

  return (
    <div className="border border-outline-variant/12 bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-headline text-lg font-bold text-on-surface">{task.title}</p>
        <span className="border border-primary-container/20 px-2 py-1 font-label text-[10px] uppercase tracking-[0.16em] text-primary-container">
          {taskPriorityLabels[priority]}
        </span>
      </div>
      <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/55">{task.description}</p>
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

      <div className="mt-4 grid gap-3">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface outline-none focus:border-primary-container"
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
          className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface outline-none focus:border-primary-container"
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
          className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface outline-none focus:border-primary-container"
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
          className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "A guardar..." : "Guardar tarefa"}
      </button>
    </div>
  );
}
