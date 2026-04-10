export type RequestStatus = "pending" | "agendado" | "atendido" | "cliente" | "fechado";

export type ClientStage = "em-processo" | "em-producao";

export type ServiceId =
  | "websites-crm"
  | "anuncios-trafego-organico"
  | "funis-conversao"
  | "consultoria-marketing"
  | "design-grafico"
  | "gestao-redes-sociais";

export type ServiceDeliveryStage = "planeado" | "em-processo" | "em-producao" | "concluido";
export type ServiceStageMap = Partial<Record<ServiceId, ServiceDeliveryStage>>;
export type TeamMemberStatus = "disponivel" | "ocupado" | "offline";
export type TaskStatus = "hoje" | "em-curso" | "em-revisao" | "feito";
export type TaskPriority = "alta" | "media" | "baixa";

export type PackService = {
  id: ServiceId;
  stage: ServiceDeliveryStage;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  status: TeamMemberStatus;
  dailyCapacity: string;
};

export type TeamTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string | null;
  clientId: string | null;
  serviceId: ServiceId | null;
};

export type ConsultationRequest = {
  id: string;
  name: string;
  email: string;
  company: string;
  revenue: string;
  challenge: string;
  focusArea: string;
  createdAt: string;
  status: RequestStatus;
  scheduledAt: string | null;
  internalNotes: string;
  clientId: string | null;
};

export type ConsultationRequestInput = {
  name: string;
  email: string;
  company: string;
  revenue: string;
  challenge: string;
  focusArea: string;
};

export type ClientRecord = {
  id: string;
  requestId: string;
  name: string;
  email: string;
  company: string;
  revenue: string;
  challenge: string;
  focusArea: string;
  createdAt: string;
  scheduledAt: string | null;
  clientStage: ClientStage;
  packName: string;
  packDescription: string;
  setupFee: string;
  monthlyFee: string;
  services: PackService[];
  internalNotes: string;
};

export type CrrmData = {
  requests: ConsultationRequest[];
  clients: ClientRecord[];
  teamMembers: TeamMember[];
  tasks: TeamTask[];
};
