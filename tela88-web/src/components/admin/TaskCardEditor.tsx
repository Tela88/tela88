"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  getServiceLabel,
  getSubserviceLabel,
  getSubservicesForService,
  taskPriorityLabels,
  taskStatusLabels,
} from "@/lib/service-catalog";
import type {
  AuthenticatedUser,
  ClientRecord,
  ServiceDefinition,
  ServiceId,
  ServiceSubservice,
  TaskPriority,
  TaskStatus,
  TeamMember,
  TeamTask,
} from "@/lib/crm-types";

function getPriorityClasses(priority: TaskPriority) {
  if (priority === "alta") {
    return "border-[#ff5a5a]/35 bg-[#221314] text-[#ff7c7c]";
  }

  if (priority === "baixa") {
    return "border-[#78f08c]/28 bg-[#132017] text-[#9df5ad]";
  }

  return "border-primary-container/16 bg-primary-container/8 text-primary-container";
}

function formatCompactDate(value: string | null) {
  if (!value) return "Sem data";
  return value.replace(/-/g, ".");
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-outline-variant/12 bg-surface-container-low px-3 py-3">
      <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">{label}</p>
      <p className="mt-2 text-sm text-on-surface">{value}</p>
    </div>
  );
}

export default function TaskCardEditor({
  task,
  teamMembers,
  clients,
  services,
  subservices,
  currentUser,
  compact = false,
}: {
  task: TeamTask;
  teamMembers: TeamMember[];
  clients: ClientRecord[];
  services: ServiceDefinition[];
  subservices: ServiceSubservice[];
  currentUser: AuthenticatedUser;
  compact?: boolean;
  initiallyCollapsed?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.configuredPriority);
  const [priorityMarginDays, setPriorityMarginDays] = useState(
    task.priorityMarginDays !== null ? String(task.priorityMarginDays) : "",
  );
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [serviceId, setServiceId] = useState<ServiceId | "">(task.serviceId ?? "");
  const [subServiceId, setSubServiceId] = useState(task.subServiceId ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const isAdmin = currentUser.role === "admin";
  const assignedMember = teamMembers.find((member) => member.id === assigneeId);
  const linkedClient = clients.find((client) => client.id === task.clientId);
  const availableServices = useMemo(() => linkedClient?.services ?? [], [linkedClient]);
  const availableSubservices = useMemo(
    () => (serviceId ? getSubservicesForService(serviceId, subservices) : []),
    [serviceId, subservices],
  );

  async function handleSave() {
    setSaving(true);

    const response = await fetch(`/api/admin/tasks/${task.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        isAdmin
          ? {
              status,
              priority,
              priorityMarginDays:
                priorityMarginDays.trim() === "" ? null : Math.max(0, Number.parseInt(priorityMarginDays, 10) || 0),
              assigneeId,
              dueDate: dueDate || null,
              serviceId: serviceId || null,
              subServiceId: subServiceId || null,
            }
          : {
              status,
            },
      ),
    });

    setSaving(false);

    if (!response.ok) return;
    setOpen(false);
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

    if (!response.ok) return;
    setOpen(false);
    router.refresh();
  }

  const compactPadding = compact ? "px-3 py-2.5" : "px-3.5 py-3";
  const linkedClientName = linkedClient ? linkedClient.company || linkedClient.name : "Sem cliente";
  const serviceLabel = serviceId ? getServiceLabel(serviceId, services) : "Sem servico";
  const subserviceLabel = getSubserviceLabel(subServiceId, subservices) || "Sem sub-servico";
  const marginRuleActive =
    task.priorityMarginDays !== null && task.dueDate
      ? `Passa para Alta a ${task.priorityMarginDays} dias do prazo`
      : null;

  return (
    <>
      <div className={`border border-outline-variant/12 bg-surface ${compactPadding}`}>
        <div className="grid gap-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="truncate text-[12px] leading-5 text-primary-container/88">{linkedClientName}</p>
            </div>

            <div className="justify-self-end">
              <span
                className={`inline-flex shrink-0 border px-2 py-1 font-label text-[9px] uppercase tracking-[0.14em] ${getPriorityClasses(priority)}`}
              >
                {taskPriorityLabels[priority]}
              </span>
            </div>
          </div>

          <p className="truncate border-b border-outline-variant/8 pb-3 text-[14px] font-semibold leading-5 text-on-surface">
            {task.title}
          </p>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <p className="truncate text-[12px] leading-5 text-on-surface/66">{assignedMember?.name ?? "Sem colaborador"}</p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] leading-5 text-on-surface/48">{formatCompactDate(task.dueDate)}</p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir tarefa"
              className="flex h-7 w-7 shrink-0 items-center justify-center text-[11px] uppercase text-on-surface/50 transition-colors hover:text-primary-container"
            >
              v
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 py-8">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-outline-variant/18 bg-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-outline-variant/12 pb-4">
              <div className="min-w-0">
                <p className="font-headline text-2xl font-bold text-on-surface">{task.title}</p>
                {linkedClient ? (
                  <p className="mt-2 truncate font-body text-sm text-on-surface/55">
                    Cliente:{" "}
                    <Link href={`/area-reservada/clientes/${linkedClient.id}`} className="text-primary-container">
                      {linkedClientName}
                    </Link>
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-outline-variant/18 px-3 py-2 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/70"
              >
                Fechar
              </button>
            </div>

            {task.description ? (
              <div className="mb-5 border border-outline-variant/12 bg-surface-container-low p-4">
                <p className="font-body text-sm leading-relaxed text-on-surface/70">{task.description}</p>
              </div>
            ) : null}

            {isAdmin && marginRuleActive ? (
              <div className="mb-5 border border-primary-container/14 bg-primary-container/6 px-4 py-3">
                <p className="font-body text-sm text-primary-container">{marginRuleActive}</p>
              </div>
            ) : null}

            {isAdmin ? (
              <>
                <div className="grid gap-3">
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as TaskStatus)}
                    className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
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
                    className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
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
                    className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
                  >
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priorityMarginDays}
                    onChange={(event) => setPriorityMarginDays(event.target.value)}
                    placeholder="Margem Prioritaria (dias)"
                    className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
                  />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
                  />

                  {linkedClient ? (
                    <>
                      <select
                        value={serviceId}
                        onChange={(event) => {
                          setServiceId(event.target.value as ServiceId | "");
                          setSubServiceId("");
                        }}
                        className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
                      >
                        <option value="">Sem servico associado</option>
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
                        className="w-full border border-outline-variant/20 bg-surface-container-low px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
                      >
                        <option value="">Sem sub-servico</option>
                        {availableSubservices.map((subservice) => (
                          <option key={subservice.id} value={subservice.id}>
                            {subservice.name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    className="border border-error/25 bg-surface-container-low px-4 py-3 font-label text-[10px] uppercase tracking-[0.18em] text-error disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deleting ? "A eliminar..." : "Eliminar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || deleting}
                    className="bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? "A guardar..." : "Guardar tarefa"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border border-outline-variant/12 bg-surface-container-low p-4">
                  <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">Estado da tarefa</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
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

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? "A guardar..." : "Guardar estado"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ReadOnlyField label="Prioridade" value={taskPriorityLabels[task.priority]} />
                  <ReadOnlyField label="Colaborador" value={assignedMember?.name ?? "Sem colaborador"} />
                  <ReadOnlyField label="Prazo" value={formatCompactDate(task.dueDate)} />
                  <ReadOnlyField label="Servico" value={serviceLabel} />
                  <ReadOnlyField label="Sub-servico" value={subserviceLabel} />
                  <ReadOnlyField label="Estado atual" value={taskStatusLabels[task.status]} />
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
