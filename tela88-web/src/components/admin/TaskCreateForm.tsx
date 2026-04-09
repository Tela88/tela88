"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getServiceLabel, taskPriorityLabels, taskStatusLabels } from "@/lib/service-catalog";
import type { ClientRecord, ServiceId, TaskPriority, TaskStatus, TeamMember } from "@/lib/crm-types";

export default function TaskCreateForm({
  teamMembers,
  clients,
  defaultClientId = "",
}: {
  teamMembers: TeamMember[];
  clients: ClientRecord[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("hoje");
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [clientId, setClientId] = useState(defaultClientId);
  const [serviceId, setServiceId] = useState<ServiceId | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId) ?? null,
    [clientId, clients],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        status,
        priority,
        assigneeId,
        dueDate: dueDate || null,
        clientId: clientId || null,
        serviceId: serviceId || null,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Nao foi possivel criar a tarefa.");
      return;
    }

    setTitle("");
    setDescription("");
    setStatus("hoje");
    setPriority("media");
    setDueDate("");
    setServiceId("");
    if (!defaultClientId) {
      setClientId("");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-outline-variant/15 bg-surface-container-low p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-headline text-xl font-bold text-on-surface">Nova tarefa</h3>
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
          Operacao
        </span>
      </div>

      <div className="grid gap-3">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titulo da tarefa"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Descricao curta"
          className="w-full resize-none border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
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
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          >
            {Object.entries(taskPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          >
            <option value="">Selecionar responsavel</option>
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
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={clientId}
            onChange={(event) => {
              setClientId(event.target.value);
              setServiceId("");
            }}
            disabled={Boolean(defaultClientId)}
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
          >
            <option value="">Sem cliente associado</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company || client.name}
              </option>
            ))}
          </select>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value as ServiceId | "")}
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          >
            <option value="">Sem servico associado</option>
            {selectedClient?.services.map((service) => (
              <option key={service.id} value={service.id}>
                {getServiceLabel(service.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="mt-3 font-body text-xs text-error">{error}</p> : null}

      <button
        type="submit"
        disabled={saving || !teamMembers.length}
        className="mt-4 w-full bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.16em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "A criar..." : "Criar tarefa"}
      </button>
    </form>
  );
}
