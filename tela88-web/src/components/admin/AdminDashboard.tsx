"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ManualClientCreateModal from "@/components/admin/ManualClientCreateModal";
import MeetingStageActions from "@/components/admin/MeetingStageActions";
import MyZoneProfileCard from "@/components/admin/MyZoneProfileCard";
import PendingRequestActions from "@/components/admin/PendingRequestActions";
import ServiceSubservicePanel from "@/components/admin/ServiceSubservicePanel";
import TaskCardEditor from "@/components/admin/TaskCardEditor";
import TaskCreateForm from "@/components/admin/TaskCreateForm";
import TeamMemberAdminCard from "@/components/admin/TeamMemberAdminCard";
import TeamMemberCreateForm from "@/components/admin/TeamMemberCreateForm";
import {
  clientStageLabels,
  focusAreaLabels,
  getServiceLabel,
  internalUserRoleLabels,
  serviceDeliveryStageLabels,
  taskStatusLabels,
  teamMemberStatusLabels,
} from "@/lib/service-catalog";
import type {
  AuthenticatedUser,
  ClientRecord,
  ConsultationRequest,
  ServiceDefinition,
  ServiceDeliveryStage,
  ServiceId,
  ServiceSubservice,
  TeamMember,
  TeamTask,
} from "@/lib/crm-types";

type DashboardTab = "tasks" | "my-zone" | "professionals" | "services" | "clients" | "meetings" | "pending" | "overview";

type AdminDashboardProps = {
  pendingRequests: ConsultationRequest[];
  scheduledMeetings: ConsultationRequest[];
  attendedMeetings: ConsultationRequest[];
  clientsFromMeetings: ConsultationRequest[];
  clients: ClientRecord[];
  teamMembers: TeamMember[];
  tasks: TeamTask[];
  services: ServiceDefinition[];
  serviceSubservices: ServiceSubservice[];
  activeTab: DashboardTab;
  currentUser: AuthenticatedUser;
};

type DragPayload =
  | { type: "meeting"; id: string }
  | { type: "client"; id: string }
  | { type: "task"; id: string };

type ServiceWorkItem = {
  key: string;
  id: ServiceId;
  stage: ServiceDeliveryStage;
  client: ClientRecord;
  activeTasks: TeamTask[];
};

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const cardScrollThreeClass = "max-h-[26rem] overflow-y-auto pr-1";
const cardScrollThreeCompactClass = "max-h-[22rem] overflow-y-auto pr-1";

function DropColumn({
  zoneId,
  activeDropZone,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: {
  zoneId: string;
  activeDropZone: string | null;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border bg-surface-container-low p-4 transition-colors ${
        activeDropZone === zoneId ? "border-primary-container" : "border-outline-variant/15"
      }`}
    >
      {children}
    </div>
  );
}

export default function AdminDashboard({
  pendingRequests,
  scheduledMeetings,
  attendedMeetings,
  clientsFromMeetings,
  clients,
  teamMembers,
  tasks,
  services,
  serviceSubservices,
  activeTab,
  currentUser,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const isAdmin = currentUser.role === "admin";
  const canManageProfessionals = currentUser.role === "admin" || currentUser.role === "secretaria";
  const normalizedTaskSearch = normalizeSearch(taskSearchQuery);
  const normalizedClientSearch = normalizeSearch(clientSearchQuery);

  function taskMatchesSearch(task: TeamTask) {
    if (!normalizedTaskSearch) return true;

    const client = clients.find((item) => item.id === task.clientId);
    const assignee = teamMembers.find((item) => item.id === task.assigneeId);
    const serviceLabel = task.serviceId ? getServiceLabel(task.serviceId, services) : "";
    const subserviceLabel =
      task.subServiceId ? serviceSubservices.find((item) => item.id === task.subServiceId)?.name ?? "" : "";

    const haystack = normalizeSearch(
      [
        task.title,
        task.description,
        client?.company,
        client?.name,
        assignee?.name,
        serviceLabel,
        subserviceLabel,
      ]
        .filter(Boolean)
        .join(" "),
    );

    return haystack.includes(normalizedTaskSearch);
  }

  function clientMatchesSearch(client: ClientRecord) {
    if (!normalizedClientSearch) return true;

    const haystack = normalizeSearch(
      [
        client.company,
        client.name,
        client.packName,
        client.packDescription,
        client.email,
        client.services.map((service) => getServiceLabel(service.id, services)).join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    );

    return haystack.includes(normalizedClientSearch);
  }

  const clientsInProcess = clients.filter((item) => item.clientStage === "planeamento");
  const clientsInProduction = clients.filter((item) => item.clientStage === "em-producao");
  const filteredClientsInProcess = clientsInProcess.filter(clientMatchesSearch);
  const filteredClientsInProduction = clientsInProduction.filter(clientMatchesSearch);
  const filteredClients = clients.filter(clientMatchesSearch);
  const totalServicesActive = clients.reduce((accumulator, client) => accumulator + client.services.length, 0);
  const openTasks = tasks.filter((task) => task.status !== "feito");
  const tasksInPlanning = tasks.filter((task) => task.status === "planeamento");
  const tasksInReview = tasks.filter((task) => task.status === "em-revisao");
  const highPriorityOpenTasks = openTasks.filter((task) => task.priority === "alta");
  const myTasks = tasks.filter((task) => task.assigneeId === currentUser.id);
  const myOpenTasks = sortTasksByPriority(myTasks.filter((task) => task.status !== "feito"));
  const myCompletedTasks = sortTasksByPriority(myTasks.filter((task) => task.status === "feito"));
  const myClientIds = new Set(myTasks.map((task) => task.clientId).filter(Boolean));
  const myClients = clients.filter((client) => myClientIds.has(client.id));
  const myServiceKeys = new Set(
    myTasks
      .filter((task) => task.clientId && task.serviceId)
      .map((task) => `${task.clientId}:${task.serviceId}`),
  );
  const serviceWorkItems = clients.flatMap<ServiceWorkItem>((client) =>
    client.services.map((service) => ({
      key: `${client.id}-${service.id}`,
      id: service.id,
      stage: service.stage,
      client,
      activeTasks: tasks.filter(
        (task) => task.clientId === client.id && task.serviceId === service.id && task.status !== "feito",
      ),
    })),
  );
  const myServices = serviceWorkItems.filter((service) => myServiceKeys.has(`${service.client.id}:${service.id}`));
  const servicesByStage: Record<ServiceDeliveryStage, ServiceWorkItem[]> = {
    planeado: serviceWorkItems.filter((service) => service.stage === "planeado"),
    "em-producao": serviceWorkItems.filter((service) => service.stage === "em-producao"),
    concluido: serviceWorkItems.filter((service) => service.stage === "concluido"),
  };
  const filteredTasks = tasks.filter(taskMatchesSearch);
  const tasksByStatus = {
    hoje: sortTasksByPriority(filteredTasks.filter((task) => task.status === "hoje")),
    planeamento: sortTasksByPriority(filteredTasks.filter((task) => task.status === "planeamento")),
    "em-producao": sortTasksByPriority(filteredTasks.filter((task) => task.status === "em-producao")),
    "em-revisao": sortTasksByPriority(filteredTasks.filter((task) => task.status === "em-revisao")),
    feito: sortTasksByPriority(filteredTasks.filter((task) => task.status === "feito")),
  };

  function dragStart(payload: DragPayload) {
    return (event: React.DragEvent<HTMLElement>) => {
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

  async function postJson(url: string, body: object) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    setActiveDropZone(null);
    if (!response.ok) return;
    router.refresh();
  }

  function columnDragOver(zoneId: string) {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setActiveDropZone(zoneId);
    };
  }

  function columnDragLeave(zoneId: string) {
    return () => {
      if (activeDropZone === zoneId) {
        setActiveDropZone(null);
      }
    };
  }

  function meetingDrop(targetStatus: "agendado" | "atendido" | "cliente", zoneId: string) {
    return async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parsePayload(event);
      if (payload?.type !== "meeting" || !payload.id) return;
      setActiveDropZone(zoneId);
      await postJson(`/api/admin/requests/${payload.id}/stage`, { status: targetStatus });
    };
  }

  function clientDrop(targetStatus: "planeamento" | "em-producao", zoneId: string) {
    return async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parsePayload(event);
      if (payload?.type !== "client" || !payload.id) return;
      setActiveDropZone(zoneId);
      await postJson(`/api/admin/clients/${payload.id}/stage`, { clientStage: targetStatus });
    };
  }

  function taskDrop(targetStatus: TeamTask["status"], zoneId: string) {
    return async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parsePayload(event);
      if (payload?.type !== "task" || !payload.id) return;
      const task = tasks.find((item) => item.id === payload.id);
      if (!task) return;
      setActiveDropZone(zoneId);
      await postJson(
        `/api/admin/tasks/${task.id}`,
        isAdmin
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
      );
    };
  }

  return (
    <div className="mt-10">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Tarefas abertas", value: String(openTasks.length).padStart(2, "0") },
          { label: "Prioridade alta", value: String(highPriorityOpenTasks.length).padStart(2, "0") },
          { label: "Servicos ativos", value: String(totalServicesActive).padStart(2, "0") },
          { label: "Clientes ativos", value: String(clients.length).padStart(2, "0") },
        ].map((card) => (
          <div key={card.label} className="border border-outline-variant/15 bg-surface-container-low p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
              {card.label}
            </p>
            <p className="mt-4 font-headline text-4xl font-bold text-on-surface">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 min-w-0">
        {activeTab === "overview" && isAdmin ? (
          <div className="space-y-8">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold text-on-surface">Painel principal</h2>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  Visao geral
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Proxima reuniao
                  </p>
                  <p className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    {scheduledMeetings[0]?.scheduledAt ? formatDate(scheduledMeetings[0].scheduledAt) : "Sem reunioes"}
                  </p>
                </div>
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Reunioes a espera
                  </p>
                  <p className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    {String(scheduledMeetings.length + attendedMeetings.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Clientes em planeamento
                  </p>
                  <p className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    {String(clientsInProcess.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Em planeamento
                  </p>
                  <p className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    {String(tasksInPlanning.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Em revisao
                  </p>
                  <p className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    {String(tasksInReview.length).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Pendentes</h3>
                  <Link href="/area-reservada?tab=pending" className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                    Ver todos
                  </Link>
                </div>
                <div className={`space-y-3 ${cardScrollThreeClass}`}>
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="border border-outline-variant/12 bg-surface p-4">
                      <p className="font-headline text-lg font-bold text-on-surface">{request.name}</p>
                      <p className="mt-1 font-body text-sm text-on-surface/55">
                        {focusAreaLabels[request.focusArea] ?? request.focusArea}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Equipa hoje</h3>
                  <Link href="/area-reservada?tab=tasks" className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                    Ver quadro
                  </Link>
                </div>
                <div className={`space-y-3 ${cardScrollThreeClass}`}>
                  {teamMembers.map((member) => {
                    const activeTasks = tasks.filter(
                      (task) => task.assigneeId === member.id && task.status !== "feito",
                    );

                    return (
                      <div key={member.id} className="border border-outline-variant/12 bg-surface p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-headline text-lg font-bold text-on-surface">{member.name}</p>
                            <p className="mt-1 font-body text-sm text-on-surface/55">{member.role}</p>
                          </div>
                          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                            {teamMemberStatusLabels[member.status]}
                          </span>
                        </div>
                        <p className="mt-3 font-body text-sm text-on-surface/55">
                          {activeTasks.length} tarefas ativas
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Clientes recentes</h3>
                  <Link href="/area-reservada?tab=clients" className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                    Ver todos
                  </Link>
                </div>
                <div className={`space-y-3 ${cardScrollThreeClass}`}>
                  {clients.slice(0, 3).map((client) => (
                    <Link
                      key={client.id}
                      href={`/area-reservada/clientes/${client.id}`}
                      className="block border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container"
                    >
                      <p className="font-headline text-lg font-bold text-on-surface">{client.company || client.name}</p>
                      <p className="mt-1 font-body text-sm text-on-surface/55">{client.packName || "Pack por definir"}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Clientes editaveis</h3>
                    <Link
                      href="/area-reservada?tab=clients"
                      className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container"
                    >
                      Abrir base
                    </Link>
                  </div>
                  <div className={`space-y-3 ${cardScrollThreeClass}`}>
                    {clients.map((client) => (
                      <Link
                        key={`overview-client-${client.id}`}
                        href={`/area-reservada/clientes/${client.id}`}
                        className="block border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container"
                      >
                        <p className="font-headline text-lg font-bold text-on-surface">
                          {client.company || client.name}
                        </p>
                        <p className="mt-1 font-body text-sm text-on-surface/55">
                          {client.packName || "Pack por definir"}
                        </p>
                        <p className="mt-2 font-label text-[10px] uppercase tracking-[0.18em] text-primary-container">
                          {clientStageLabels[client.clientStage]}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Servicos ativos</h3>
                    <Link
                      href="/area-reservada?tab=services"
                      className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container"
                    >
                      Gerir servicos
                    </Link>
                  </div>
                  <div className={`space-y-3 ${cardScrollThreeClass}`}>
                    {serviceWorkItems.length === 0 ? (
                      <div className="border border-dashed border-outline-variant/15 px-4 py-8 text-center">
                        <p className="font-body text-sm text-on-surface/45">Sem servicos ativos neste momento.</p>
                      </div>
                    ) : (
                      serviceWorkItems.map((service) => (
                        <Link
                          key={`overview-service-${service.key}`}
                          href={`/area-reservada/clientes/${service.client.id}`}
                          className="block border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-headline text-lg font-bold text-on-surface">
                                {getServiceLabel(service.id, services)}
                              </p>
                              <p className="mt-1 font-body text-sm text-on-surface/55">
                                {service.client.company || service.client.name}
                              </p>
                            </div>
                            <span className="shrink-0 border border-primary-container/20 px-2 py-1 font-label text-[10px] uppercase tracking-[0.18em] text-primary-container">
                              {service.activeTasks.length} tarefas
                            </span>
                          </div>
                          <p className="mt-3 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
                            {serviceDeliveryStageLabels[service.stage]}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Todas as tarefas</h3>
                    <span className="mt-2 block font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                      Edicao total
                    </span>
                  </div>
                  <div className="w-full max-w-md">
                    <input
                      type="search"
                      value={taskSearchQuery}
                      onChange={(event) => setTaskSearchQuery(event.target.value)}
                      placeholder="Pesquisar tarefas, cliente, servico ou colaborador"
                      className="w-full border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface/35 focus:border-primary-container"
                    />
                  </div>
                </div>
                {filteredTasks.length === 0 ? (
                  <div className="border border-dashed border-outline-variant/15 px-4 py-8 text-center">
                    <p className="font-body text-sm text-on-surface/45">
                      Nao ha tarefas que correspondam a esta pesquisa.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="grid min-w-[1200px] gap-4 xl:grid-cols-5">
                      {(Object.keys(tasksByStatus) as Array<keyof typeof tasksByStatus>).map((statusKey) => {
                        const zoneId = `overview-task-${statusKey}`;

                        return (
                          <DropColumn
                            key={zoneId}
                            zoneId={zoneId}
                            activeDropZone={activeDropZone}
                            onDragOver={columnDragOver(zoneId)}
                            onDragLeave={columnDragLeave(zoneId)}
                            onDrop={taskDrop(statusKey, zoneId)}
                          >
                            <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
                              <p className="font-headline text-lg font-bold text-on-surface">
                                {taskStatusLabels[statusKey]}
                              </p>
                              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                                {String(tasksByStatus[statusKey].length).padStart(2, "0")}
                              </span>
                            </div>

                            <div className={`space-y-3 ${cardScrollThreeCompactClass}`}>
                              {tasksByStatus[statusKey].length === 0 ? (
                                <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                                  <p className="font-body text-xs text-on-surface/45">Larga aqui uma tarefa.</p>
                                </div>
                              ) : (
                                tasksByStatus[statusKey].map((task) => (
                                  <div
                                    key={`overview-${task.id}`}
                                    draggable
                                    onDragStart={dragStart({ type: "task", id: task.id })}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    <TaskCardEditor
                                      task={task}
                                      teamMembers={teamMembers}
                                      clients={clients}
                                      services={services}
                                      subservices={serviceSubservices}
                                      currentUser={currentUser}
                                    />
                                  </div>
                                ))
                              )}
                            </div>
                          </DropColumn>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "pending" ? (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Pedidos pendentes</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                Confirmar reuniao
              </span>
            </div>

            <div className="space-y-5">
              {pendingRequests.map((request) => (
                <article
                  key={request.id}
                  className="grid gap-6 border border-outline-variant/15 bg-surface-container-low p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.6fr)]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">{request.name}</h3>
                      <span className="border border-primary-container/25 px-3 py-1 font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                        {focusAreaLabels[request.focusArea] ?? request.focusArea}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="border border-outline-variant/12 bg-surface p-4">
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">Email</p>
                        <p className="mt-2 font-body text-sm text-on-surface">{request.email}</p>
                      </div>
                      <div className="border border-outline-variant/12 bg-surface p-4">
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">Empresa</p>
                        <p className="mt-2 font-body text-sm text-on-surface">{request.company || "Nao indicada"}</p>
                      </div>
                      <div className="border border-outline-variant/12 bg-surface p-4 md:col-span-2">
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">Desafio</p>
                        <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/65">{request.challenge}</p>
                      </div>
                    </div>
                  </div>

                  <aside className="border border-outline-variant/12 bg-surface p-5">
                    <PendingRequestActions requestId={request.id} />
                  </aside>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "meetings" ? (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Kaban de reunioes</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                Arrasta entre Agendado, Atendido e Cliente
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {[
                { key: "agendado", label: "Agendado", items: scheduledMeetings },
                { key: "atendido", label: "Atendido", items: attendedMeetings },
                { key: "cliente", label: "Cliente", items: clientsFromMeetings },
              ].map((column) => {
                const zoneId = `meeting-${column.key}`;

                return (
                  <DropColumn
                    key={column.key}
                    zoneId={zoneId}
                    activeDropZone={activeDropZone}
                    onDragOver={columnDragOver(zoneId)}
                    onDragLeave={columnDragLeave(zoneId)}
                    onDrop={meetingDrop(column.key as "agendado" | "atendido" | "cliente", zoneId)}
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
                      <p className="font-headline text-xl font-bold text-on-surface">{column.label}</p>
                      <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                        {String(column.items.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className={`space-y-3 ${cardScrollThreeClass}`}>
                      {column.items.length === 0 ? (
                        <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                          <p className="font-body text-xs text-on-surface/45">Larga aqui um cartao.</p>
                        </div>
                      ) : (
                        column.items.map((request) => (
                          <div
                            key={request.id}
                            draggable
                            onDragStart={dragStart({ type: "meeting", id: request.id })}
                            className="cursor-grab border border-outline-variant/12 bg-surface p-4 active:cursor-grabbing"
                          >
                            <p className="font-headline text-lg font-bold text-on-surface">{request.name}</p>
                            <p className="mt-1 font-body text-sm text-on-surface/55">
                              {request.company || request.email}
                            </p>
                            {request.scheduledAt ? (
                              <p className="mt-2 font-body text-xs text-on-surface/45">
                                {formatDate(request.scheduledAt)}
                              </p>
                            ) : null}
                            <div className="mt-4">
                              {column.key === "agendado" ? <MeetingStageActions requestId={request.id} mode="atendido" /> : null}
                              {column.key === "atendido" ? <MeetingStageActions requestId={request.id} mode="cliente" /> : null}
                              {column.key === "cliente" && request.clientId ? (
                                <Link
                                  href={`/area-reservada/clientes/${request.clientId}`}
                                  className="block border border-primary-container/25 px-4 py-3 text-center font-label text-[10px] uppercase tracking-[0.2em] text-primary-container"
                                >
                                  Abrir cliente
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </DropColumn>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab === "my-zone" ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Tarefas abertas", value: String(myOpenTasks.length).padStart(2, "0") },
                { label: "Clientes ligados", value: String(myClients.length).padStart(2, "0") },
                { label: "Servicos ligados", value: String(myServices.length).padStart(2, "0") },
                { label: "Role", value: currentUser.functionRole || currentUser.role },
              ].map((card) => (
                <div key={card.label} className="border border-outline-variant/15 bg-surface-container-low p-5">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    {card.label}
                  </p>
                  <p className="mt-3 font-headline text-2xl font-bold text-on-surface">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-headline text-3xl font-bold text-on-surface">As minhas tarefas</h2>
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="h-10 w-10 rounded-full border border-outline-variant/20 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-low text-xs font-bold text-primary-container">
                        {currentUser.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="font-body text-sm text-on-surface">{currentUser.name}</p>
                      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                        {currentUser.functionRole || currentUser.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {myTasks.length === 0 ? (
                    <div className="border border-dashed border-outline-variant/15 bg-surface-container-low px-4 py-8 text-center xl:col-span-2">
                      <p className="font-body text-sm text-on-surface/45">Ainda nao tens tarefas atribuidas.</p>
                    </div>
                  ) : (
                    myOpenTasks.map((task) => (
                      <TaskCardEditor
                        key={task.id}
                        task={task}
                        teamMembers={teamMembers}
                        clients={clients}
                        services={services}
                        subservices={serviceSubservices}
                        currentUser={currentUser}
                      />
                    ))
                  )}
                </div>

                {myCompletedTasks.length > 0 ? (
                  <div className="mt-8 border-t border-outline-variant/12 pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Finalizadas</h3>
                      <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                        {String(myCompletedTasks.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {myCompletedTasks.map((task) => (
                        <TaskCardEditor
                          key={task.id}
                          task={task}
                          teamMembers={teamMembers}
                          clients={clients}
                          services={services}
                          subservices={serviceSubservices}
                          currentUser={currentUser}
                          initiallyCollapsed
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="space-y-6">
                <MyZoneProfileCard user={currentUser} />

                <div className="border border-outline-variant/15 bg-surface-container-low p-5">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Clientes ligados</h3>
                  <div className={`mt-4 space-y-3 ${cardScrollThreeClass}`}>
                    {myClients.length === 0 ? (
                      <p className="font-body text-sm text-on-surface/45">Sem clientes associados por tarefa.</p>
                    ) : (
                      myClients.map((client) => (
                        <Link
                          key={client.id}
                          href={`/area-reservada/clientes/${client.id}`}
                          className="block border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container"
                        >
                          <p className="font-headline text-lg font-bold text-on-surface">
                            {client.company || client.name}
                          </p>
                          <p className="mt-1 font-body text-sm text-on-surface/55">
                            {client.packName || "Pack por definir"}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="border border-outline-variant/15 bg-surface-container-low p-5">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Servicos ligados</h3>
                  <div className={`mt-4 space-y-3 ${cardScrollThreeClass}`}>
                    {myServices.length === 0 ? (
                      <p className="font-body text-sm text-on-surface/45">Sem servicos associados por tarefa.</p>
                    ) : (
                      myServices.map((service) => (
                        <Link
                          key={service.key}
                          href={`/area-reservada/clientes/${service.client.id}`}
                          className="block border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container"
                        >
                          <p className="font-headline text-lg font-bold text-on-surface">
                            {getServiceLabel(service.id, services)}
                          </p>
                          <p className="mt-1 font-body text-sm text-on-surface/55">
                            {service.client.company || service.client.name}
                          </p>
                          <p className="mt-2 font-label text-[10px] uppercase tracking-[0.18em] text-primary-container">
                            {serviceDeliveryStageLabels[service.stage]}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : null}

        {activeTab === "services" && isAdmin ? (
          <div className="space-y-8">
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-headline text-3xl font-bold text-on-surface">Gestao de servicos</h2>
                  <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-on-surface/55">
                    Vista agregada dos servicos vendidos por cliente. Cada cartao mostra estado, cliente e tarefas
                    abertas associadas.
                  </p>
                </div>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  Tarefas ligadas a entregas
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {(Object.keys(servicesByStage) as ServiceDeliveryStage[]).map((stage) => (
                  <div key={stage} className="border border-outline-variant/15 bg-surface-container-low p-5">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                      {serviceDeliveryStageLabels[stage]}
                    </p>
                    <p className="mt-3 font-headline text-3xl font-bold text-on-surface">
                      {String(servicesByStage[stage].length).padStart(2, "0")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {(Object.keys(servicesByStage) as ServiceDeliveryStage[]).map((stage) => (
                <div key={stage} className="border border-outline-variant/15 bg-surface-container-low p-4">
                  <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
                    <p className="font-headline text-xl font-bold text-on-surface">
                      {serviceDeliveryStageLabels[stage]}
                    </p>
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                      {String(servicesByStage[stage].length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className={`space-y-3 ${cardScrollThreeClass}`}>
                    {servicesByStage[stage].length === 0 ? (
                      <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                        <p className="font-body text-xs text-on-surface/45">Sem servicos nesta fase.</p>
                      </div>
                    ) : (
                      servicesByStage[stage].map((service) => (
                        <Link
                          key={service.key}
                          href={`/area-reservada/clientes/${service.client.id}`}
                          className="block border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-headline text-lg font-bold text-on-surface">
                              {getServiceLabel(service.id, services)}
                            </p>
                            <span className="shrink-0 border border-primary-container/20 px-2 py-1 font-label text-[10px] uppercase tracking-[0.16em] text-primary-container">
                              {service.activeTasks.length} tarefas
                            </span>
                          </div>
                          <p className="mt-2 font-body text-sm text-on-surface/55">
                            {service.client.company || service.client.name}
                          </p>
                          <p className="mt-3 font-body text-xs leading-relaxed text-on-surface/45">
                            {service.client.packName || "Pack por definir"}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <ServiceSubservicePanel services={services} subservices={serviceSubservices} isAdmin={isAdmin} />
          </div>
        ) : null}

        {activeTab === "clients" ? (
          <div className="space-y-8">
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-headline text-3xl font-bold text-on-surface">Kaban de clientes</h2>
                  <p className="mt-2 font-body text-sm text-on-surface/55">
                    Entrada direta de clientes e organizacao da base ativa.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Arrasta entre Planeamento e Em producao
                  </span>
                  {isAdmin ? <ManualClientCreateModal services={services} /> : null}
                </div>
              </div>

              <div className="mb-5 max-w-md">
                <input
                  type="search"
                  value={clientSearchQuery}
                  onChange={(event) => setClientSearchQuery(event.target.value)}
                  placeholder="Pesquisar cliente, pack ou servico"
                  className="w-full border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface/35 focus:border-primary-container"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {[
                  { key: "planeamento", label: "Planeamento", items: filteredClientsInProcess },
                  { key: "em-producao", label: "Em producao", items: filteredClientsInProduction },
                ].map((column) => {
                  const zoneId = `client-${column.key}`;

                  return (
                    <DropColumn
                      key={column.key}
                      zoneId={zoneId}
                      activeDropZone={activeDropZone}
                      onDragOver={columnDragOver(zoneId)}
                      onDragLeave={columnDragLeave(zoneId)}
                      onDrop={isAdmin ? clientDrop(column.key as "planeamento" | "em-producao", zoneId) : async () => {}}
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
                        <p className="font-headline text-xl font-bold text-on-surface">{column.label}</p>
                        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                          {String(column.items.length).padStart(2, "0")}
                        </span>
                      </div>
                      <div className={`space-y-3 ${cardScrollThreeClass}`}>
                        {column.items.length === 0 ? (
                          <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                            <p className="font-body text-xs text-on-surface/45">Larga aqui um cliente.</p>
                          </div>
                        ) : (
                          column.items.map((client) => (
                            <Link
                              key={client.id}
                              href={`/area-reservada/clientes/${client.id}`}
                              draggable={isAdmin}
                              onDragStart={isAdmin ? dragStart({ type: "client", id: client.id }) : undefined}
                              className={`block border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container ${
                                isAdmin ? "cursor-grab active:cursor-grabbing" : ""
                              }`}
                            >
                              <p className="font-headline text-lg font-bold text-on-surface">{client.company || client.name}</p>
                              <p className="mt-1 font-body text-sm text-on-surface/55">{client.packName || "Pack por definir"}</p>
                              <p className="mt-2 font-body text-xs text-on-surface/45">{client.services.length} servicos</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </DropColumn>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-headline text-3xl font-bold text-on-surface">Base de clientes</h2>
                  <span className="mt-2 block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Gestao individual
                  </span>
                </div>
                <div className="w-full max-w-md">
                  <input
                    type="search"
                    value={clientSearchQuery}
                    onChange={(event) => setClientSearchQuery(event.target.value)}
                    placeholder="Pesquisar cliente, pack ou servico"
                    className="w-full border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface/35 focus:border-primary-container"
                  />
                </div>
              </div>

              <div className={`space-y-4 ${cardScrollThreeClass}`}>
                {filteredClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/area-reservada/clientes/${client.id}`}
                    className="grid gap-4 border border-outline-variant/15 bg-surface-container-low p-5 transition-colors hover:border-primary-container md:grid-cols-[minmax(0,0.8fr)_minmax(180px,0.3fr)_minmax(220px,0.35fr)]"
                  >
                    <div>
                      <p className="font-headline text-xl font-bold text-on-surface">{client.company || client.name}</p>
                      <p className="mt-2 font-body text-sm text-on-surface/60">{client.packName || "Pack por definir"}</p>
                    </div>
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">Kaban</p>
                      <p className="mt-2 font-body text-sm text-on-surface/70">{clientStageLabels[client.clientStage]}</p>
                    </div>
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">Servicos</p>
                      <p className="mt-2 font-body text-sm text-on-surface/70">
                        {client.services.length > 0 ? client.services.map((service) => getServiceLabel(service.id, services)).join(", ") : "Por definir"}
                      </p>
                    </div>
                  </Link>
                ))}
                {filteredClients.length === 0 ? (
                  <div className="border border-dashed border-outline-variant/15 px-4 py-8 text-center">
                    <p className="font-body text-sm text-on-surface/45">
                      Nao ha clientes que correspondam a esta pesquisa.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "professionals" && canManageProfessionals ? (
          <div className="space-y-8">
            <div className="border border-outline-variant/15 bg-surface-container-low p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-headline text-2xl font-bold text-on-surface">Capacidade e distribuicao</h3>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                  Tempo real
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {teamMembers.map((member) => {
                  const activeTasks = tasks.filter((task) => task.assigneeId === member.id && task.status !== "feito");

                  return (
                    <div key={`capacity-${member.id}`} className="border border-outline-variant/12 bg-surface p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-headline text-lg font-bold text-on-surface">{member.name}</p>
                          <p className="mt-1 truncate font-body text-sm text-on-surface/55">{member.role}</p>
                        </div>
                        <span className="shrink-0 border border-primary-container/18 px-2 py-1 font-label text-[10px] uppercase tracking-[0.18em] text-primary-container">
                          {teamMemberStatusLabels[member.status]}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 font-body text-sm text-on-surface/62">
                        <p>{activeTasks.length} tarefas ativas</p>
                        <p>{member.dailyCapacity}</p>
                        <p>{member.email || "Sem email"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.42fr)_minmax(0,1fr)]">
              <TeamMemberCreateForm services={services} />

              <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Painel de edicao</h3>
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Perfis internos
                  </span>
                </div>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <div className="border border-outline-variant/12 bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
                        Contas internas
                      </p>
                      <span className="font-label text-[10px] uppercase tracking-[0.18em] text-primary-container">
                        {teamMembers.length} perfis
                      </span>
                    </div>

                    <div className={`mt-4 space-y-3 ${cardScrollThreeClass}`}>
                      {teamMembers.map((member) => (
                        <div
                          key={`account-panel-${member.id}`}
                          className="grid gap-3 border border-outline-variant/12 bg-surface-container-low p-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,0.45fr)]"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              {member.avatarUrl ? (
                                <img
                                  src={member.avatarUrl}
                                  alt={member.name}
                                  className="h-10 w-10 rounded-full border border-outline-variant/20 object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/20 bg-surface text-xs font-bold text-primary-container">
                                  {member.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-headline text-base font-bold text-on-surface">
                                  {member.name}
                                </p>
                                <p className="truncate font-body text-xs text-on-surface/55">
                                  @{member.username || "sem-username"} ·{" "}
                                  {internalUserRoleLabels[member.accessRole ?? "collaborator"]}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start justify-start md:justify-end">
                            <span className="border border-primary-container/18 px-2 py-1 font-label text-[10px] uppercase tracking-[0.18em] text-primary-container">
                              {teamMemberStatusLabels[member.status]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-outline-variant/12 bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
                        Ligacoes por servico
                      </p>
                      <span className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
                        Edita nos cartoes abaixo
                      </span>
                    </div>

                    <div className={`mt-4 space-y-3 ${cardScrollThreeClass}`}>
                      {teamMembers.map((member) => (
                        <div
                          key={`service-panel-${member.id}`}
                          className="border border-outline-variant/12 bg-surface-container-low p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-headline text-base font-bold text-on-surface">
                                {member.name}
                              </p>
                              <p className="truncate font-body text-xs text-on-surface/55">{member.role}</p>
                            </div>
                            <span className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
                              {member.assignedServiceIds.length} servicos
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {member.assignedServiceIds.length === 0 ? (
                              <span className="font-body text-sm text-on-surface/45">Sem servicos ligados.</span>
                            ) : (
                              member.assignedServiceIds.map((serviceId) => (
                                <span
                                  key={`service-chip-${member.id}-${serviceId}`}
                                  className="border border-primary-container/18 bg-primary-container/8 px-2 py-1 font-body text-xs text-primary-container"
                                >
                                  {getServiceLabel(serviceId, services)}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-3xl font-bold text-on-surface">Profissionais</h2>
                  <p className="mt-2 font-body text-sm text-on-surface/55">
                    Vista dedicada para gerir a equipa, perfis, capacidade e acesso interno.
                  </p>
                </div>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  Equipa interna
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {teamMembers.map((member) => (
                  <TeamMemberAdminCard
                    key={`professional-${member.id}`}
                    member={member}
                    tasks={tasks}
                    services={services}
                    isAdmin={canManageProfessionals}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "tasks" ? (
          <div className="space-y-8">
            <div className="grid gap-4 xl:grid-cols-1">
              <TaskCreateForm teamMembers={teamMembers} clients={clients} services={services} subservices={serviceSubservices} />
            </div>

            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-headline text-3xl font-bold text-on-surface">Tarefas diarias</h2>
                  <span className="mt-2 block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Arrasta entre Hoje, Planeamento, Produção, Revisão e Feito
                  </span>
                </div>
                <div className="w-full max-w-md">
                  <input
                    type="search"
                    value={taskSearchQuery}
                    onChange={(event) => setTaskSearchQuery(event.target.value)}
                    placeholder="Pesquisar tarefas, cliente, servico ou colaborador"
                    className="w-full border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface/35 focus:border-primary-container"
                  />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-5">
                {(Object.keys(tasksByStatus) as Array<keyof typeof tasksByStatus>).map((statusKey) => {
                  const zoneId = `task-${statusKey}`;

                  return (
                    <DropColumn
                      key={statusKey}
                      zoneId={zoneId}
                      activeDropZone={activeDropZone}
                      onDragOver={columnDragOver(zoneId)}
                      onDragLeave={columnDragLeave(zoneId)}
                      onDrop={taskDrop(statusKey, zoneId)}
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
                        <p className="font-headline text-xl font-bold text-on-surface">{taskStatusLabels[statusKey]}</p>
                        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                          {String(tasksByStatus[statusKey].length).padStart(2, "0")}
                        </span>
                      </div>
                      <div className={`space-y-3 ${cardScrollThreeClass}`}>
                        {tasksByStatus[statusKey].length === 0 ? (
                          <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                            <p className="font-body text-xs text-on-surface/45">Larga aqui uma tarefa.</p>
                          </div>
                        ) : (
                          tasksByStatus[statusKey].map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={dragStart({ type: "task", id: task.id })}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <TaskCardEditor
                                task={task}
                                teamMembers={teamMembers}
                                clients={clients}
                                services={services}
                                subservices={serviceSubservices}
                                currentUser={currentUser}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </DropColumn>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}



