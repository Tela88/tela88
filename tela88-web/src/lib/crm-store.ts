import { randomUUID } from "node:crypto";
import { deleteRows, insertRow, selectRows, selectSingle, updateRows } from "@/lib/supabase-rest";
import type {
  ClientRecord,
  ClientStage,
  ConsultationRequest,
  ConsultationRequestInput,
  CrrmData,
  InternalUserRole,
  PackService,
  RequestStatus,
  ServiceDeliveryStage,
  ServiceId,
  ServiceStageMap,
  TaskPriority,
  TaskStatus,
  TeamMember,
  TeamMemberStatus,
  TeamTask,
} from "@/lib/crm-types";

type UserRow = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: InternalUserRole;
  function_role: string;
  status: TeamMemberStatus;
  daily_capacity: string;
};

type RequestRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  revenue: string;
  challenge: string;
  focus_area: string;
  created_at: string;
  status: RequestStatus;
  scheduled_at: string | null;
  internal_notes: string;
  client_id: string | null;
};

type ClientRow = {
  id: string;
  request_id: string;
  name: string;
  email: string;
  company: string;
  revenue: string;
  challenge: string;
  focus_area: string;
  created_at: string;
  scheduled_at: string | null;
  client_stage: ClientStage;
  pack_name: string;
  pack_description: string;
  setup_fee: string;
  monthly_fee: string;
  internal_notes: string;
};

type ClientServiceRow = {
  id: string;
  client_id: string;
  service_id: ServiceId;
  stage: ServiceDeliveryStage;
};

type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  client_id: string | null;
  service_id: ServiceId | null;
};

function mapRequest(row: RequestRow): ConsultationRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    revenue: row.revenue,
    challenge: row.challenge,
    focusArea: row.focus_area,
    createdAt: row.created_at,
    status: row.status,
    scheduledAt: row.scheduled_at,
    internalNotes: row.internal_notes,
    clientId: row.client_id,
  };
}

function mapTeamMember(row: UserRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.function_role,
    accessRole: row.role,
    username: row.username,
    email: row.email,
    status: row.status,
    dailyCapacity: row.daily_capacity,
  };
}

function mapClient(row: ClientRow, services: ClientServiceRow[]): ClientRecord {
  return {
    id: row.id,
    requestId: row.request_id,
    name: row.name,
    email: row.email,
    company: row.company,
    revenue: row.revenue,
    challenge: row.challenge,
    focusArea: row.focus_area,
    createdAt: row.created_at,
    scheduledAt: row.scheduled_at,
    clientStage: row.client_stage,
    packName: row.pack_name,
    packDescription: row.pack_description,
    setupFee: row.setup_fee,
    monthlyFee: row.monthly_fee,
    services: services
      .filter((service) => service.client_id === row.id)
      .map<PackService>((service) => ({
        id: service.service_id,
        stage: service.stage,
      })),
    internalNotes: row.internal_notes,
  };
}

function mapTask(row: TaskRow): TeamTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id ?? "",
    dueDate: row.due_date,
    clientId: row.client_id,
    serviceId: row.service_id,
  };
}

async function getClientServices() {
  return selectRows<ClientServiceRow>("client_services", {
    order: "created_at.asc",
  });
}

export async function createConsultationRequest(
  input: ConsultationRequestInput,
): Promise<ConsultationRequest> {
  const request = await insertRow<RequestRow>("consultation_requests", {
    name: input.name,
    email: input.email,
    company: input.company,
    revenue: input.revenue,
    challenge: input.challenge,
    focus_area: input.focusArea,
    status: "pending",
  });

  if (!request) {
    throw new Error("Nao foi possivel criar o pedido.");
  }

  return mapRequest(request);
}

export async function getConsultationRequests() {
  const rows = await selectRows<RequestRow>("consultation_requests", {
    order: "created_at.desc",
  });

  return rows.map(mapRequest);
}

export async function getClients() {
  const [clients, services] = await Promise.all([
    selectRows<ClientRow>("clients", { order: "created_at.desc" }),
    getClientServices(),
  ]);

  return clients.map((client) => mapClient(client, services));
}

export async function getTeamMembers() {
  const rows = await selectRows<UserRow>("internal_users", {
    order: "created_at.asc",
  });

  return rows.filter((user) => user.role === "collaborator").map(mapTeamMember);
}

export async function getTasks() {
  const rows = await selectRows<TaskRow>("team_tasks", {
    order: "created_at.desc",
  });

  return rows.map(mapTask);
}

export async function getCrmDashboardData(): Promise<CrrmData> {
  const [requests, clients, teamMembers, tasks] = await Promise.all([
    getConsultationRequests(),
    getClients(),
    getTeamMembers(),
    getTasks(),
  ]);

  return {
    requests,
    clients,
    teamMembers,
    tasks,
  };
}

export async function getClientById(id: string) {
  const [client, services] = await Promise.all([
    selectSingle<ClientRow>("clients", {
      filters: { id },
    }),
    getClientServices(),
  ]);

  return client ? mapClient(client, services) : null;
}

export async function confirmConsultationRequest(id: string, scheduledAt: string, notes: string) {
  const rows = await updateRows<RequestRow>(
    "consultation_requests",
    { id },
    {
      status: "agendado",
      scheduled_at: scheduledAt,
      internal_notes: notes,
      updated_at: new Date().toISOString(),
    },
  );

  if (!rows[0]) {
    throw new Error("Pedido nao encontrado.");
  }

  return mapRequest(rows[0]);
}

export async function markMeetingAttended(id: string) {
  const rows = await updateRows<RequestRow>(
    "consultation_requests",
    { id },
    {
      status: "atendido",
      updated_at: new Date().toISOString(),
    },
  );

  if (!rows[0]) {
    throw new Error("Pedido nao encontrado.");
  }

  return mapRequest(rows[0]);
}

export async function updateRequestStage(input: {
  id: string;
  status: Extract<RequestStatus, "agendado" | "atendido" | "cliente">;
}) {
  const request = await selectSingle<RequestRow>("consultation_requests", {
    filters: { id: input.id },
  });

  if (!request) {
    throw new Error("Pedido nao encontrado.");
  }

  let clientId = request.client_id;

  if (input.status === "cliente" && !clientId) {
    const client = await insertRow<ClientRow>("clients", {
      request_id: request.id,
      name: request.name,
      email: request.email,
      company: request.company,
      revenue: request.revenue,
      challenge: request.challenge,
      focus_area: request.focus_area,
      scheduled_at: request.scheduled_at,
      internal_notes: request.internal_notes,
      client_stage: "em-processo",
    });

    clientId = client?.id ?? null;
  }

  const rows = await updateRows<RequestRow>(
    "consultation_requests",
    { id: input.id },
    {
      status: input.status,
      client_id: clientId,
      updated_at: new Date().toISOString(),
    },
  );

  return mapRequest(rows[0]);
}

export async function convertRequestToClient(input: { requestId: string }) {
  const request = await updateRequestStage({ id: input.requestId, status: "cliente" });
  return request.clientId ? getClientById(request.clientId) : null;
}

export async function updateClient(input: {
  id: string;
  clientStage: "em-processo" | "em-producao";
  packName: string;
  packDescription: string;
  setupFee: string;
  monthlyFee: string;
  services: ServiceId[];
  serviceStages: ServiceStageMap;
  notes: string;
  scheduledAt: string | null;
}) {
  const rows = await updateRows<ClientRow>(
    "clients",
    { id: input.id },
    {
      client_stage: input.clientStage,
      pack_name: input.packName,
      pack_description: input.packDescription,
      setup_fee: input.setupFee,
      monthly_fee: input.monthlyFee,
      internal_notes: input.notes,
      scheduled_at: input.scheduledAt,
      updated_at: new Date().toISOString(),
    },
  );

  const client = rows[0];
  if (!client) {
    throw new Error("Cliente nao encontrado.");
  }

  await deleteRows<ClientServiceRow>("client_services", { client_id: input.id });
  await Promise.all(
    input.services.map((serviceId) =>
      insertRow<ClientServiceRow>("client_services", {
        client_id: input.id,
        service_id: serviceId,
        stage: input.serviceStages[serviceId] ?? "planeado",
      }),
    ),
  );

  if (client.request_id && !client.request_id.startsWith("manual-")) {
    await updateRows<RequestRow>(
      "consultation_requests",
      { id: client.request_id },
      {
        status: "cliente",
        scheduled_at: input.scheduledAt,
        internal_notes: input.notes,
        updated_at: new Date().toISOString(),
      },
    );
  }

  return getClientById(client.id);
}

export async function updateClientStage(input: {
  id: string;
  clientStage: ClientStage;
}) {
  const rows = await updateRows<ClientRow>(
    "clients",
    { id: input.id },
    {
      client_stage: input.clientStage,
      updated_at: new Date().toISOString(),
    },
  );

  if (!rows[0]) {
    throw new Error("Cliente nao encontrado.");
  }

  const services = await getClientServices();
  return mapClient(rows[0], services);
}

export async function createTeamMember(input: {
  name: string;
  role: string;
  status: TeamMemberStatus;
  dailyCapacity: string;
}) {
  const username = input.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || randomUUID();
  const row = await insertRow<UserRow>("internal_users", {
    username,
    email: `${username}@tela88.local`,
    name: input.name,
    role: "collaborator",
    function_role: input.role,
    status: input.status,
    daily_capacity: input.dailyCapacity,
    password_hash: "pending-password-reset",
  });

  if (!row) {
    throw new Error("Nao foi possivel criar o colaborador.");
  }

  return mapTeamMember(row);
}

export async function createManualClient(input: {
  name: string;
  email: string;
  company: string;
  revenue: string;
  challenge: string;
  focusArea: string;
  clientStage: ClientStage;
  packName: string;
  packDescription: string;
  setupFee: string;
  monthlyFee: string;
  notes: string;
  scheduledAt: string | null;
  services: ServiceId[];
  serviceStages: ServiceStageMap;
}) {
  const row = await insertRow<ClientRow>("clients", {
    request_id: `manual-${randomUUID()}`,
    name: input.name,
    email: input.email,
    company: input.company,
    revenue: input.revenue,
    challenge: input.challenge,
    focus_area: input.focusArea,
    client_stage: input.clientStage,
    pack_name: input.packName,
    pack_description: input.packDescription,
    setup_fee: input.setupFee,
    monthly_fee: input.monthlyFee,
    internal_notes: input.notes,
    scheduled_at: input.scheduledAt,
  });

  if (!row) {
    throw new Error("Nao foi possivel criar o cliente.");
  }

  await Promise.all(
    input.services.map((serviceId) =>
      insertRow<ClientServiceRow>("client_services", {
        client_id: row.id,
        service_id: serviceId,
        stage: input.serviceStages[serviceId] ?? "planeado",
      }),
    ),
  );

  return getClientById(row.id);
}

export async function updateTask(input: {
  id: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string | null;
}) {
  const rows = await updateRows<TaskRow>(
    "team_tasks",
    { id: input.id },
    {
      status: input.status,
      priority: input.priority,
      assignee_id: input.assigneeId || null,
      due_date: input.dueDate,
      updated_at: new Date().toISOString(),
    },
  );

  if (!rows[0]) {
    throw new Error("Tarefa nao encontrada.");
  }

  return mapTask(rows[0]);
}

export async function createTask(input: {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string | null;
  clientId: string | null;
  serviceId: ServiceId | null;
}) {
  const row = await insertRow<TaskRow>("team_tasks", {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    assignee_id: input.assigneeId || null,
    due_date: input.dueDate,
    client_id: input.clientId,
    service_id: input.serviceId,
  });

  if (!row) {
    throw new Error("Nao foi possivel criar a tarefa.");
  }

  return mapTask(row);
}
