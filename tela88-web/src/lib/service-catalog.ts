import type {
  ClientStage,
  ServiceDeliveryStage,
  ServiceId,
  ServiceSubservice,
  TaskPriority,
  TaskStatus,
  TeamMemberStatus,
} from "@/lib/crm-types";

export const serviceCatalog: { id: ServiceId; label: string; summary: string }[] = [
  { id: "websites-crm", label: "Websites e CRM", summary: "Plataformas, landing pages, CRM e automações base." },
  { id: "anuncios-trafego-organico", label: "Anúncios e Tráfego Orgânico", summary: "Aquisição paga, SEO editorial e performance contínua." },
  { id: "funis-conversao", label: "Funis de Conversão", summary: "Captação, nurturing e sequências para fechar mais leads." },
  { id: "consultoria-marketing", label: "Consultoria de Marketing", summary: "Planeamento, posicionamento e direção estratégica." },
  { id: "design-grafico", label: "Design Gráfico", summary: "Peças visuais, criativos e identidade aplicada ao digital." },
  { id: "gestao-redes-sociais", label: "Gestão de Redes Sociais", summary: "Calendário, publicação e acompanhamento editorial." },
];

export const focusAreaLabels: Record<string, string> = {
  visibilidade: "Visibilidade",
  trafego: "Tráfego",
  conversao: "Conversão",
  retencao: "Retenção",
  "trabalho-pontual": "Trabalho pontual",
  "trabalho-continuo": "Trabalho contínuo",
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
  "em-producao": "Em produção",
};

export const serviceDeliveryStageLabels: Record<ServiceDeliveryStage, string> = {
  planeado: "Planeado",
  "em-producao": "Em produção",
  concluido: "Concluído",
};

export const teamMemberStatusLabels: Record<TeamMemberStatus, string> = {
  disponivel: "Disponível",
  ocupado: "Ocupado",
  offline: "Offline",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  hoje: "Hoje",
  planeamento: "Planeamento",
  "em-producao": "Produção",
  "em-revisao": "Revisão",
  feito: "Feito",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export function getServiceLabel(serviceId: ServiceId) {
  return serviceCatalog.find((item) => item.id === serviceId)?.label ?? serviceId;
}

export function getServiceSummary(serviceId: ServiceId) {
  return serviceCatalog.find((item) => item.id === serviceId)?.summary ?? "";
}

export function getSubservicesForService(serviceId: ServiceId, subservices: ServiceSubservice[]) {
  return subservices.filter((item) => item.serviceId === serviceId);
}

export function getSubserviceLabel(subServiceId: string | null | undefined, subservices: ServiceSubservice[]) {
  if (!subServiceId) return "";
  return subservices.find((item) => item.id === subServiceId)?.name ?? "";
}
