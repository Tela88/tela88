import type {
  ClientStage,
  InternalUserRole,
  ServiceDefinition,
  ServiceDeliveryStage,
  ServiceId,
  ServiceSubservice,
  TaskPriority,
  TaskStatus,
  TeamMemberStatus,
} from "@/lib/crm-types";

export const serviceCatalog: ServiceDefinition[] = [
  { id: "websites-crm", label: "Websites e CRM", summary: "Plataformas, landing pages, CRM e automacoes base." },
  {
    id: "anuncios-trafego-organico",
    label: "Anuncios e Trafego Organico",
    summary: "Aquisicao paga, SEO editorial e performance continua.",
  },
  {
    id: "funis-conversao",
    label: "Funis de Conversao",
    summary: "Captacao, nurturing e sequencias para fechar mais leads.",
  },
  {
    id: "consultoria-marketing",
    label: "Consultoria de Marketing",
    summary: "Planeamento, posicionamento e direcao estrategica.",
  },
  {
    id: "design-grafico",
    label: "Design Grafico",
    summary: "Pecas visuais, criativos e identidade aplicada ao digital.",
  },
  {
    id: "gestao-redes-sociais",
    label: "Gestao de Redes Sociais",
    summary: "Calendario, publicacao e acompanhamento editorial.",
  },
];

export const focusAreaLabels: Record<string, string> = {
  visibilidade: "Visibilidade",
  trafego: "Trafego",
  conversao: "Conversao",
  retencao: "Retencao",
  "trabalho-pontual": "Trabalho pontual",
  "trabalho-continuo": "Trabalho continuo",
};

export const requestStatusLabels = {
  pending: "Pendente",
  agendado: "Agendado",
  atendido: "Atendido",
  cliente: "Cliente",
  fechado: "Fechado",
} satisfies Record<string, string>;

export const clientStageLabels: Record<ClientStage, string> = {
  planeamento: "Planeamento",
  "em-producao": "Em producao",
};

export const serviceDeliveryStageLabels: Record<ServiceDeliveryStage, string> = {
  planeado: "Planeado",
  "em-producao": "Em producao",
  concluido: "Concluido",
};

export const teamMemberStatusLabels: Record<TeamMemberStatus, string> = {
  disponivel: "Disponivel",
  ocupado: "Ocupado",
  offline: "Offline",
};

export const internalUserRoleLabels: Record<InternalUserRole, string> = {
  admin: "Admin",
  collaborator: "Colaborador",
  secretaria: "Secretaria",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  hoje: "Hoje",
  planeamento: "Planeamento",
  "em-producao": "Producao",
  "em-revisao": "Revisao",
  feito: "Feito",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  alta: "Alta",
  media: "Media",
  baixa: "Baixa",
};

export function getServiceLabel(serviceId: ServiceId, services: ServiceDefinition[] = serviceCatalog) {
  return services.find((item) => item.id === serviceId)?.label ?? serviceId;
}

export function getServiceSummary(serviceId: ServiceId, services: ServiceDefinition[] = serviceCatalog) {
  return services.find((item) => item.id === serviceId)?.summary ?? "";
}

export function getSubservicesForService(serviceId: ServiceId, subservices: ServiceSubservice[]) {
  return subservices.filter((item) => item.serviceId === serviceId);
}

export function getSubserviceLabel(subServiceId: string | null | undefined, subservices: ServiceSubservice[]) {
  if (!subServiceId) return "";
  return subservices.find((item) => item.id === subServiceId)?.name ?? "";
}
