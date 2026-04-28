import { randomUUID } from "node:crypto";
import { createPasswordHash } from "@/lib/auth";
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
  ServiceSubservice,
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
  avatar_url?: string | null;
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
  request_id: string | null;
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

type InternalUserServiceRow = {
  id: string;
  user_id: string;
  service_id: ServiceId;
};

type ServiceSubserviceRow = {
  id: string;
  service_id: ServiceId;
  slug: string;
  name: string;
  description: string;
};

type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  priority_margin_days: number | null;
  assignee_id: string | null;
  due_date: string | null;
  client_id: string | null;
  service_id: ServiceId | null;
  sub_service_id: string | null;
};

function getEffectiveTaskPriority(
  configuredPriority: TaskPriority,
  dueDate: string | null,
  priorityMarginDays: number | null,
) {
  if (!dueDate || priorityMarginDays === null || priorityMarginDays < 0) {
    return configuredPriority;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(dueDate);
  deadline.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDeadline = Math.floor((deadline.getTime() - today.getTime()) / msPerDay);

  if (daysUntilDeadline <= priorityMarginDays) {
    return "alta";
  }

  return configuredPriority;
}

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

function mapTeamMember(row: UserRow, assignedServiceIds: ServiceId[] = []): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.function_role,
    accessRole: row.role,
    assignedServiceIds,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url ?? null,
    status: row.status,
    dailyCapacity: row.daily_capacity,
  };
}

function mapClient(row: ClientRow, services: ClientServiceRow[]): ClientRecord {
  return {
    id: row.id,
    requestId: row.request_id ?? "",
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

function mapSubservice(row: ServiceSubserviceRow): ServiceSubservice {
  return {
    id: row.id,
    serviceId: row.service_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
  };
}

function mapTask(row: TaskRow): TeamTask {
  const effectivePriority = getEffectiveTaskPriority(row.priority, row.due_date, row.priority_margin_days);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: effectivePriority,
    configuredPriority: row.priority,
    priorityMarginDays: row.priority_margin_days,
    assigneeId: row.assignee_id ?? "",
    dueDate: row.due_date,
    clientId: row.client_id,
    serviceId: row.service_id,
    subServiceId: row.sub_service_id,
  };
}

function createUsernameSlug(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "") || randomUUID()
  );
}

async function getClientServices() {
  return selectRows<ClientServiceRow>("client_services", {
    order: "created_at.asc",
  });
}

async function getInternalUserServices() {
  return selectRows<InternalUserServiceRow>("internal_user_services", {
    order: "created_at.asc",
  });
}

export async function getServiceSubservices() {
  const rows = await selectRows<ServiceSubserviceRow>("service_subservices", {
    order: "service_id.asc,name.asc",
  });

  return rows.map(mapSubservice);
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
  const [rows, assignments] = await Promise.all([
    selectRows<UserRow>("internal_users", {
      order: "created_at.asc",
    }),
    getInternalUserServices(),
  ]);

  return rows
    .filter((user) => user.role !== "admin")
    .map((user) =>
      mapTeamMember(
        user,
        assignments.filter((assignment) => assignment.user_id === user.id).map((assignment) => assignment.service_id),
      ),
    );
}

export async function getTasks() {
  const rows = await selectRows<TaskRow>("team_tasks", {
    order: "created_at.desc",
  });

  return rows.map(mapTask);
}

export async function getCrmDashboardData(): Promise<CrrmData> {
  const [requests, clients, teamMembers, tasks, serviceSubservices] = await Promise.all([
    getConsultationRequests(),
    getClients(),
    getTeamMembers(),
    getTasks(),
    getServiceSubservices(),
  ]);

  return {
    requests,
    clients,
    teamMembers,
    tasks,
    serviceSubservices,
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
      client_stage: "planeamento",
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
  clientStage: "planeamento" | "em-producao";
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
  username?: string;
  email?: string;
  password: string;
  accessRole: Exclude<InternalUserRole, "admin">;
  role: string;
  serviceIds: ServiceId[];
  status: TeamMemberStatus;
  dailyCapacity: string;
}) {
  const username = createUsernameSlug(input.username?.trim() || input.name);
  const row = await insertRow<UserRow>("internal_users", {
    username,
    email: input.email?.trim() || `${username}@tela88.local`,
    name: input.name,
    role: input.accessRole,
    function_role: input.role,
    status: input.status,
    daily_capacity: input.dailyCapacity,
    password_hash: createPasswordHash(input.password),
  });

  if (!row) {
    throw new Error("Nao foi possivel criar o colaborador.");
  }

  await Promise.all(
    input.serviceIds.map((serviceId) =>
      insertRow<InternalUserServiceRow>("internal_user_services", {
        user_id: row.id,
        service_id: serviceId,
      }),
    ),
  );

  return mapTeamMember(row, input.serviceIds);
}

export async function updateTeamMember(input: {
  id: string;
  name: string;
  username: string;
  email: string;
  accessRole: Exclude<InternalUserRole, "admin">;
  role: string;
  serviceIds: ServiceId[];
  status: TeamMemberStatus;
  dailyCapacity: string;
  password?: string;
}) {
  const existing = await selectSingle<(UserRow & { password_hash: string })>("internal_users", {
    filters: { id: input.id },
  });

  if (!existing || existing.role === "admin") {
    throw new Error("Colaborador nao encontrado.");
  }

  const payload: Record<string, string> = {
    name: input.name.trim(),
    username: createUsernameSlug(input.username),
    email: input.email.trim(),
    role: input.accessRole,
    function_role: input.role.trim(),
    status: input.status,
    daily_capacity: input.dailyCapacity.trim(),
    updated_at: new Date().toISOString(),
  };

  if (input.password?.trim()) {
    payload.password_hash = createPasswordHash(input.password.trim());
  }

  const rows = await updateRows<UserRow>("internal_users", { id: input.id }, payload);

  if (!rows[0]) {
    throw new Error("Nao foi possivel atualizar o colaborador.");
  }

  await deleteRows<InternalUserServiceRow>("internal_user_services", { user_id: input.id });
  await Promise.all(
    input.serviceIds.map((serviceId) =>
      insertRow<InternalUserServiceRow>("internal_user_services", {
        user_id: input.id,
        service_id: serviceId,
      }),
    ),
  );

  return mapTeamMember(rows[0], input.serviceIds);
}

export async function deleteTeamMember(id: string) {
  const existing = await selectSingle<UserRow>("internal_users", {
    filters: { id },
  });

  if (!existing || existing.role === "admin") {
    throw new Error("Colaborador nao encontrado.");
  }

  await deleteRows<InternalUserServiceRow>("internal_user_services", { user_id: id });
  const deleted = await deleteRows<UserRow>("internal_users", { id });

  if (!deleted.length) {
    throw new Error("Nao foi possivel eliminar o colaborador.");
  }

  return { id };
}

export async function updateUserProfile(input: {
  id: string;
  avatarUrl: string | null;
}) {
  const rows = await updateRows<UserRow>("internal_users", { id: input.id }, {
    avatar_url: input.avatarUrl,
    updated_at: new Date().toISOString(),
  });

  if (!rows[0]) {
    throw new Error("Nao foi possivel atualizar o perfil.");
  }

  return mapTeamMember(rows[0]);
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
    request_id: null,
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

export async function createServiceSubservice(input: {
  serviceId: ServiceId;
  name: string;
  description: string;
}) {
  const slug =
    input.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || randomUUID();

  const row = await insertRow<ServiceSubserviceRow>("service_subservices", {
    service_id: input.serviceId,
    slug,
    name: input.name.trim(),
    description: input.description.trim(),
  });

  if (!row) {
    throw new Error("Nao foi possivel criar o sub-servico.");
  }

  return mapSubservice(row);
}

export async function deleteServiceSubservice(id: string) {
  const deleted = await deleteRows<ServiceSubserviceRow>("service_subservices", { id });

  if (!deleted.length) {
    throw new Error("Sub-servico nao encontrado.");
  }

  return { id };
}

export async function updateTask(input: {
  id: string;
  status: TaskStatus;
  priority?: TaskPriority;
  priorityMarginDays?: number | null;
  assigneeId?: string;
  dueDate?: string | null;
  serviceId?: ServiceId | null;
  subServiceId?: string | null;
}) {
  const existing = await selectSingle<TaskRow>("team_tasks", {
    filters: { id: input.id },
  });

  if (!existing) {
    throw new Error("Tarefa nao encontrada.");
  }

  const rows = await updateRows<TaskRow>(
    "team_tasks",
    { id: input.id },
    {
      status: input.status,
      priority: input.priority ?? existing.priority,
      priority_margin_days:
        input.priorityMarginDays === undefined ? existing.priority_margin_days : input.priorityMarginDays,
      assignee_id: input.assigneeId === undefined ? existing.assignee_id : input.assigneeId || null,
      due_date: input.dueDate === undefined ? existing.due_date : input.dueDate,
      service_id: input.serviceId === undefined ? existing.service_id : input.serviceId,
      sub_service_id: input.subServiceId === undefined ? existing.sub_service_id : input.subServiceId,
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
  priorityMarginDays?: number | null;
  assigneeId: string;
  dueDate: string | null;
  clientId: string | null;
  serviceId: ServiceId | null;
  subServiceId: string | null;
}) {
  const row = await insertRow<TaskRow>("team_tasks", {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    priority_margin_days: input.priorityMarginDays ?? null,
    assignee_id: input.assigneeId || null,
    due_date: input.dueDate,
    client_id: input.clientId,
    service_id: input.serviceId,
    sub_service_id: input.subServiceId,
  });

  if (!row) {
    throw new Error("Nao foi possivel criar a tarefa.");
  }

  return mapTask(row);
}

export async function deleteTask(id: string) {
  const deleted = await deleteRows<TaskRow>("team_tasks", { id });

  if (!deleted.length) {
    throw new Error("Tarefa nao encontrada.");
  }

  return { id };
}
