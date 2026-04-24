"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ManualClientCreateModal from "@/components/admin/ManualClientCreateModal";
import MeetingStageActions from "@/components/admin/MeetingStageActions";
import PendingRequestActions from "@/components/admin/PendingRequestActions";
import TaskCardEditor from "@/components/admin/TaskCardEditor";
import TaskCreateForm from "@/components/admin/TaskCreateForm";
import TeamMemberCreateForm from "@/components/admin/TeamMemberCreateForm";
import {
  clientStageLabels,
  focusAreaLabels,
  getServiceLabel,
  serviceDeliveryStageLabels,
  taskStatusLabels,
  teamMemberStatusLabels,
} from "@/lib/service-catalog";
import type {
  AuthenticatedUser,
  ClientRecord,
  ConsultationRequest,
  ServiceDeliveryStage,
  ServiceId,
  TeamMember,
  TeamTask,
} from "@/lib/crm-types";

type DashboardTab = "tasks" | "my-zone" | "services" | "clients" | "meetings" | "pending" | "overview";

type AdminDashboardProps = {
  pendingRequests: ConsultationRequest[];
  scheduledMeetings: ConsultationRequest[];
  attendedMeetings: ConsultationRequest[];
  clientsFromMeetings: ConsultationRequest[];
  clients: ClientRecord[];
  teamMembers: TeamMember[];
  tasks: TeamTask[];
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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
  activeTab,
  currentUser,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  const clientsInProcess = clients.filter((item) => item.clientStage === "em-processo");
  const clientsInProduction = clients.filter((item) => item.clientStage === "em-producao");
  const totalServicesActive = clients.reduce((accumulator, client) => accumulator + client.services.length, 0);
  const openTasks = tasks.filter((task) => task.status !== "feito");
  const tasksDueToday = tasks.filter((task) => task.status === "hoje");
  const tasksInReview = tasks.filter((task) => task.status === "em-revisao");
  const highPriorityOpenTasks = openTasks.filter((task) => task.priority === "alta");
  const myTasks = tasks.filter((task) => task.assigneeId === currentUser.id);
  const myOpenTasks = myTasks.filter((task) => task.status !== "feito");
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
    "em-processo": serviceWorkItems.filter((service) => service.stage === "em-processo"),
    "em-producao": serviceWorkItems.filter((service) => service.stage === "em-producao"),
    concluido: serviceWorkItems.filter((service) => service.stage === "concluido"),
  };
  const tasksByStatus = {
    hoje: tasks.filter((task) => task.status === "hoje"),
    "em-curso": tasks.filter((task) => task.status === "em-curso"),
    "em-revisao": tasks.filter((task) => task.status === "em-revisao"),
    feito: tasks.filter((task) => task.status === "feito"),
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

  function clientDrop(targetStatus: "em-processo" | "em-producao", zoneId: string) {
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
      await postJson(`/api/admin/tasks/${task.id}`, {
        status: targetStatus,
        priority: task.priority,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
      });
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
        {activeTab === "overview" ? (
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
                    Clientes em processo
                  </p>
                  <p className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    {String(clientsInProcess.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    Tarefas para hoje
                  </p>
                  <p className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    {String(tasksDueToday.length).padStart(2, "0")}
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
                <div className="space-y-3">
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
                <div className="space-y-3">
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
                <div className="space-y-3">
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
                    <div className="space-y-3">
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
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                    {currentUser.name}
                  </span>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {myTasks.length === 0 ? (
                    <div className="border border-dashed border-outline-variant/15 bg-surface-container-low px-4 py-8 text-center xl:col-span-2">
                      <p className="font-body text-sm text-on-surface/45">Ainda nao tens tarefas atribuidas.</p>
                    </div>
                  ) : (
                    myTasks.map((task) => (
                      <TaskCardEditor key={task.id} task={task} teamMembers={teamMembers} clients={clients} />
                    ))
                  )}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="border border-outline-variant/15 bg-surface-container-low p-5">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Clientes ligados</h3>
                  <div className="mt-4 space-y-3">
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
                  <div className="mt-4 space-y-3">
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
                            {getServiceLabel(service.id)}
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

        {activeTab === "services" ? (
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

              <div className="grid gap-4 md:grid-cols-4">
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

            <div className="grid gap-4 xl:grid-cols-4">
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

                  <div className="space-y-3">
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
                              {getServiceLabel(service.id)}
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
          </div>
        ) : null}

        {activeTab === "clients" ? (
          <div className="space-y-8">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold text-on-surface">Kaban de clientes</h2>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  Arrasta entre Em processo e Em producao
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {[
                  { key: "em-processo", label: "Em processo", items: clientsInProcess },
                  { key: "em-producao", label: "Em producao", items: clientsInProduction },
                ].map((column) => {
                  const zoneId = `client-${column.key}`;

                  return (
                    <DropColumn
                      key={column.key}
                      zoneId={zoneId}
                      activeDropZone={activeDropZone}
                      onDragOver={columnDragOver(zoneId)}
                      onDragLeave={columnDragLeave(zoneId)}
                      onDrop={clientDrop(column.key as "em-processo" | "em-producao", zoneId)}
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
                        <p className="font-headline text-xl font-bold text-on-surface">{column.label}</p>
                        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                          {String(column.items.length).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {column.items.length === 0 ? (
                          <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                            <p className="font-body text-xs text-on-surface/45">Larga aqui um cliente.</p>
                          </div>
                        ) : (
                          column.items.map((client) => (
                            <Link
                              key={client.id}
                              href={`/area-reservada/clientes/${client.id}`}
                              draggable
                              onDragStart={dragStart({ type: "client", id: client.id })}
                              className="block cursor-grab border border-outline-variant/12 bg-surface p-4 transition-colors hover:border-primary-container active:cursor-grabbing"
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
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold text-on-surface">Base de clientes</h2>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  Gestao individual
                </span>
              </div>

              <div className="space-y-4">
                {clients.map((client) => (
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
                        {client.services.length > 0 ? client.services.map((service) => getServiceLabel(service.id)).join(", ") : "Por definir"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "tasks" ? (
          <div className="space-y-8">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold text-on-surface">Tarefas e equipa</h2>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  Visao tipo ClickUp
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {teamMembers.map((member) => {
                  const memberTasks = tasks.filter((task) => task.assigneeId === member.id);
                  return (
                    <div key={member.id} className="border border-outline-variant/15 bg-surface-container-low p-6">
                      <p className="font-headline text-xl font-bold text-on-surface">{member.name}</p>
                      <p className="mt-1 font-body text-sm text-on-surface/55">{member.role}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                          {teamMemberStatusLabels[member.status]}
                        </span>
                        <span className="font-body text-sm text-on-surface/55">{member.dailyCapacity}</span>
                      </div>
                      <p className="mt-4 font-body text-sm text-on-surface/55">{memberTasks.length} tarefas atribuidas</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.42fr)_minmax(0,1fr)]">
              <TeamMemberCreateForm />
              <TaskCreateForm teamMembers={teamMembers} clients={clients} />
            </div>

            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold text-on-surface">Tarefas diarias</h2>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  Arrasta entre Hoje, Em curso, Em revisao e Feito
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-4">
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
                              onDragStart={dragStart({ type: "task", id: task.id })}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <TaskCardEditor task={task} teamMembers={teamMembers} clients={clients} />
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

