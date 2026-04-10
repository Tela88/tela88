import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  ClientRecord,
  ConsultationRequest,
  ConsultationRequestInput,
  CrrmData,
  ClientStage,
  RequestStatus,
  ServiceDeliveryStage,
  ServiceId,
  ServiceStageMap,
  TeamMember,
  TeamTask,
  TaskPriority,
  TaskStatus,
  TeamMemberStatus,
} from "@/lib/crm-types";

const dataDirectory = path.join(process.cwd(), "data");
const legacyRequestsPath = path.join(dataDirectory, "consultation-requests.json");
const crmPath = path.join(dataDirectory, "crm-data.json");

const emptyData: CrrmData = {
  requests: [],
  clients: [],
  teamMembers: [],
  tasks: [],
};

function normalizeTeamMember(raw: Partial<TeamMember>): TeamMember {
  return {
    id: raw.id ?? randomUUID(),
    name: raw.name ?? "",
    role: raw.role ?? "",
    status: (raw.status ?? "disponivel") as TeamMemberStatus,
    dailyCapacity: raw.dailyCapacity ?? "",
  };
}

function normalizeTask(raw: Partial<TeamTask>): TeamTask {
  return {
    id: raw.id ?? randomUUID(),
    title: raw.title ?? "",
    description: raw.description ?? "",
    status: (raw.status ?? "hoje") as TaskStatus,
    priority: (raw.priority ?? "media") as TaskPriority,
    assigneeId: raw.assigneeId ?? "",
    dueDate: raw.dueDate ?? null,
    clientId: raw.clientId ?? null,
    serviceId: raw.serviceId ?? null,
  };
}

async function ensureStore() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(crmPath, "utf8");
  } catch {
    const migrated = await migrateLegacyData();
    await writeData(migrated);
  }
}

function normalizeClient(raw: Partial<ClientRecord> & { requestId?: string }): ClientRecord {
  return {
    id: raw.id ?? randomUUID(),
    requestId: raw.requestId ?? "",
    name: raw.name ?? "",
    email: raw.email ?? "",
    company: raw.company ?? "",
    revenue: raw.revenue ?? "",
    challenge: raw.challenge ?? "",
    focusArea: raw.focusArea ?? "",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    scheduledAt: raw.scheduledAt ?? null,
    clientStage: raw.clientStage ?? "em-processo",
    packName: raw.packName ?? "",
    packDescription: raw.packDescription ?? "",
    setupFee: raw.setupFee ?? "",
    monthlyFee: raw.monthlyFee ?? "",
    services: (raw.services ?? []).map((service) => {
      if (typeof service === "string") {
        return {
          id: service as ServiceId,
          stage: "planeado" as ServiceDeliveryStage,
        };
      }

      return {
        id: service.id,
        stage: service.stage ?? "planeado",
      };
    }),
    internalNotes: raw.internalNotes ?? "",
  };
}

async function migrateLegacyData(): Promise<CrrmData> {
  try {
    const raw = await readFile(crmPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CrrmData>;

    return {
      requests: (parsed.requests ?? []).map((item) => ({
        id: item.id ?? randomUUID(),
        name: item.name ?? "",
        email: item.email ?? "",
        company: item.company ?? "",
        revenue: item.revenue ?? "",
        challenge: item.challenge ?? "",
        focusArea: item.focusArea ?? "",
        createdAt: item.createdAt ?? new Date().toISOString(),
        status: item.status ?? "pending",
        scheduledAt: item.scheduledAt ?? null,
        internalNotes: item.internalNotes ?? "",
        clientId: item.clientId ?? null,
      })),
      clients: (parsed.clients ?? []).map((item) => normalizeClient(item)),
      teamMembers: (parsed.teamMembers ?? []).map((item) => normalizeTeamMember(item)),
      tasks: (parsed.tasks ?? []).map((item) => normalizeTask(item)),
    };
  } catch {
    try {
      const legacy = await readFile(legacyRequestsPath, "utf8");
      const parsed = JSON.parse(legacy) as Partial<ConsultationRequest>[];

      return {
        requests: parsed.map((item) => ({
          id: item.id ?? randomUUID(),
          name: item.name ?? "",
          email: item.email ?? "",
          company: item.company ?? "",
          revenue: item.revenue ?? "",
          challenge: item.challenge ?? "",
          focusArea: item.focusArea ?? "",
          createdAt: item.createdAt ?? new Date().toISOString(),
          status: item.status ?? "pending",
          scheduledAt: item.scheduledAt ?? null,
          internalNotes: item.internalNotes ?? "",
          clientId: item.clientId ?? null,
        })),
        clients: [],
        teamMembers: [],
        tasks: [],
      };
    } catch {
      return emptyData;
    }
  }
}

async function readData(): Promise<CrrmData> {
  await ensureStore();
  const file = await readFile(crmPath, "utf8");
  const parsed = JSON.parse(file) as CrrmData;

  return {
    requests: (parsed.requests ?? []).map((item) => ({
      id: item.id ?? randomUUID(),
      name: item.name ?? "",
      email: item.email ?? "",
      company: item.company ?? "",
      revenue: item.revenue ?? "",
      challenge: item.challenge ?? "",
      focusArea: item.focusArea ?? "",
      createdAt: item.createdAt ?? new Date().toISOString(),
      status: item.status ?? "pending",
      scheduledAt: item.scheduledAt ?? null,
      internalNotes: item.internalNotes ?? "",
      clientId: item.clientId ?? null,
    })),
    clients: (parsed.clients ?? []).map((item) => normalizeClient(item)),
    teamMembers: (parsed.teamMembers ?? []).map((item) => normalizeTeamMember(item)),
    tasks: (parsed.tasks ?? []).map((item) => normalizeTask(item)),
  };
}

async function writeData(data: CrrmData) {
  await writeFile(crmPath, JSON.stringify(data, null, 2), "utf8");
}

export async function createConsultationRequest(
  input: ConsultationRequestInput,
): Promise<ConsultationRequest> {
  const data = await readData();

  const request: ConsultationRequest = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    scheduledAt: null,
    internalNotes: "",
    clientId: null,
    ...input,
  };

  data.requests.unshift(request);
  await writeData(data);

  return request;
}

export async function getConsultationRequests() {
  const data = await readData();
  return data.requests.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function getClients() {
  const data = await readData();
  return data.clients.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function getTeamMembers() {
  const data = await readData();
  return data.teamMembers;
}

export async function getTasks() {
  const data = await readData();
  return data.tasks;
}

export async function getCrmDashboardData() {
  const data = await readData();
  const requests = data.requests.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const clients = data.clients.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  return {
    requests,
    clients,
    teamMembers: data.teamMembers,
    tasks: data.tasks,
  };
}

export async function getClientById(id: string) {
  const clients = await getClients();
  return clients.find((client) => client.id === id) ?? null;
}

export async function confirmConsultationRequest(id: string, scheduledAt: string, notes: string) {
  const data = await readData();
  const request = data.requests.find((item) => item.id === id);

  if (!request) {
    throw new Error("Pedido não encontrado.");
  }

  request.status = "agendado";
  request.scheduledAt = scheduledAt;
  request.internalNotes = notes;

  await writeData(data);
  return request;
}

export async function markMeetingAttended(id: string) {
  const data = await readData();
  const request = data.requests.find((item) => item.id === id);

  if (!request) {
    throw new Error("Pedido não encontrado.");
  }

  request.status = "atendido";
  await writeData(data);
  return request;
}

export async function updateRequestStage(input: {
  id: string;
  status: Extract<RequestStatus, "agendado" | "atendido" | "cliente">;
}) {
  const data = await readData();
  const request = data.requests.find((item) => item.id === input.id);

  if (!request) {
    throw new Error("Pedido nao encontrado.");
  }

  request.status = input.status;

  if (input.status === "cliente" && !request.clientId) {
    const client = normalizeClient({
      id: randomUUID(),
      requestId: request.id,
      name: request.name,
      email: request.email,
      company: request.company,
      revenue: request.revenue,
      challenge: request.challenge,
      focusArea: request.focusArea,
      createdAt: new Date().toISOString(),
      scheduledAt: request.scheduledAt,
      clientStage: "em-processo",
      packName: "",
      packDescription: "",
      setupFee: "",
      monthlyFee: "",
      services: [],
      internalNotes: request.internalNotes,
    });

    request.clientId = client.id;
    data.clients.unshift(client);
  }

  await writeData(data);
  return request;
}

export async function convertRequestToClient(input: { requestId: string }) {
  const data = await readData();
  const request = data.requests.find((item) => item.id === input.requestId);

  if (!request) {
    throw new Error("Pedido não encontrado.");
  }

  if (request.clientId) {
    return data.clients.find((item) => item.id === request.clientId) ?? null;
  }

  const client = normalizeClient({
    id: randomUUID(),
    requestId: request.id,
    name: request.name,
    email: request.email,
    company: request.company,
    revenue: request.revenue,
    challenge: request.challenge,
    focusArea: request.focusArea,
    createdAt: new Date().toISOString(),
    scheduledAt: request.scheduledAt,
    clientStage: "em-processo",
    packName: "",
    packDescription: "",
    setupFee: "",
    monthlyFee: "",
    services: [],
    internalNotes: request.internalNotes,
  });

  request.status = "cliente";
  request.clientId = client.id;

  data.clients.unshift(client);
  await writeData(data);

  return client;
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
  const data = await readData();
  const client = data.clients.find((item) => item.id === input.id);

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  const previousStages = new Map(client.services.map((service) => [service.id, service.stage]));

  client.clientStage = input.clientStage;
  client.packName = input.packName;
  client.packDescription = input.packDescription;
  client.setupFee = input.setupFee;
  client.monthlyFee = input.monthlyFee;
  client.internalNotes = input.notes;
  client.scheduledAt = input.scheduledAt;
  client.services = input.services.map((serviceId) => ({
    id: serviceId,
    stage: input.serviceStages[serviceId] ?? previousStages.get(serviceId) ?? "planeado",
  }));

  const sourceRequest = data.requests.find((item) => item.id === client.requestId);
  if (sourceRequest) {
    sourceRequest.scheduledAt = input.scheduledAt;
    sourceRequest.internalNotes = input.notes;
    sourceRequest.status = "cliente";
  }

  await writeData(data);
  return client;
}

export async function updateClientStage(input: {
  id: string;
  clientStage: ClientStage;
}) {
  const data = await readData();
  const client = data.clients.find((item) => item.id === input.id);

  if (!client) {
    throw new Error("Cliente nao encontrado.");
  }

  client.clientStage = input.clientStage;
  await writeData(data);
  return client;
}

export async function updateTask(input: {
  id: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string | null;
}) {
  const data = await readData();
  const task = data.tasks.find((item) => item.id === input.id);

  if (!task) {
    throw new Error("Tarefa não encontrada.");
  }

  task.status = input.status;
  task.priority = input.priority;
  task.assigneeId = input.assigneeId;
  task.dueDate = input.dueDate;

  await writeData(data);
  return task;
}

export async function createTeamMember(input: {
  name: string;
  role: string;
  status: TeamMemberStatus;
  dailyCapacity: string;
}) {
  const data = await readData();
  const member = normalizeTeamMember({
    id: randomUUID(),
    name: input.name,
    role: input.role,
    status: input.status,
    dailyCapacity: input.dailyCapacity,
  });

  data.teamMembers.unshift(member);
  await writeData(data);
  return member;
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
  const data = await readData();
  const task = normalizeTask({
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate,
    clientId: input.clientId,
    serviceId: input.serviceId,
  });

  data.tasks.unshift(task);
  await writeData(data);
  return task;
}
