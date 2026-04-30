"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getServiceLabel, getSubservicesForService, taskPriorityLabels } from "@/lib/service-catalog";
import type { ClientRecord, ServiceDefinition, ServiceId, ServiceSubservice, TaskPriority, TeamMember } from "@/lib/crm-types";

function getTodayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TaskCreateForm({
  teamMembers,
  clients,
  services,
  subservices,
  defaultClientId = "",
}: {
  teamMembers: TeamMember[];
  clients: ClientRecord[];
  services: ServiceDefinition[];
  subservices: ServiceSubservice[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(defaultClientId);
  const [serviceId, setServiceId] = useState<ServiceId | "">("");
  const [subServiceId, setSubServiceId] = useState("");
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const minDueDate = getTodayDateInputValue();

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId) ?? null,
    [clientId, clients],
  );
  const availableServices = selectedClient?.services ?? [];
  const availableSubservices = useMemo(
    () => (serviceId ? getSubservicesForService(serviceId, subservices) : []),
    [serviceId, subservices],
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
        priority,
        assigneeId,
        dueDate: dueDate || null,
        clientId: clientId || null,
        serviceId: serviceId || null,
        subServiceId: subServiceId || null,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Nao foi possivel criar a tarefa.");
      return;
    }

    setServiceId("");
    setSubServiceId("");
    setAssigneeId(teamMembers[0]?.id ?? "");
    setDueDate("");
    setTitle("");
    setDescription("");
    setPriority("media");
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
        <select
          value={clientId}
          onChange={(event) => {
            setClientId(event.target.value);
            setServiceId("");
            setSubServiceId("");
          }}
          disabled={Boolean(defaultClientId)}
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
        >
          <option value="">Cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company || client.name}
            </option>
          ))}
        </select>

        <select
          value={serviceId}
          onChange={(event) => {
            setServiceId(event.target.value as ServiceId | "");
            setSubServiceId("");
          }}
          disabled={!selectedClient}
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
        >
          <option value="">Serviço</option>
          {availableServices.map((service) => (
            <option key={service.id} value={service.id}>
              {getServiceLabel(service.id, services)}
            </option>
          ))}
        </select>

        <select
          value={subServiceId}
          onChange={(event) => setSubServiceId(event.target.value)}
          disabled={!serviceId}
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
        >
          <option value="">Sub-serviço</option>
          {availableSubservices.map((subservice) => (
            <option key={subservice.id} value={subservice.id}>
              {subservice.name}
            </option>
          ))}
        </select>

        <select
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        >
          <option value="">Colaborador</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          min={minDueDate}
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Descrição"
          className="w-full resize-none border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />

        <div className="border border-outline-variant/20 bg-surface px-3 py-3">
          <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">Estado inicial</p>
          <p className="mt-2 font-body text-sm text-on-surface">Planeamento</p>
        </div>

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
