import type {
  ClientStage,
  ServiceDeliveryStage,
  ServiceId,
  TaskPriority,
  TaskStatus,
  TeamMemberStatus,
} from "@/lib/crm-types";

export const serviceCatalog: { id: ServiceId; label: string }[] = [
  { id: "websites-crm", label: "Websites e CRM" },
  { id: "anuncios-trafego-organico", label: "Anúncios e Tráfego Orgânico" },
  { id: "funis-conversao", label: "Funis de Conversão" },
  { id: "consultoria-marketing", label: "Consultoria de Marketing" },
  { id: "design-grafico", label: "Design Gráfico" },
  { id: "gestao-redes-sociais", label: "Gestão de Redes Sociais" },
];

export const focusAreaLabels: Record<string, string> = {
  visibilidade: "Visibilidade",
  trafego: "Tráfego",
  conversao: "Conversão",
  retencao: "Retenção",
};

export const requestStatusLabels = {
  pending: "Pendente",
  agendado: "Agendado",
  atendido: "Atendido",
  cliente: "Cliente",
  fechado: "Fechado",
} satisfies Record<string, string>;

export const clientStageLabels: Record<ClientStage, string> = {
  "em-processo": "Em processo",
  "em-producao": "Em produção",
};

export const serviceDeliveryStageLabels: Record<ServiceDeliveryStage, string> = {
  planeado: "Planeado",
  "em-processo": "Em processo",
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
  "em-curso": "Em curso",
  "em-revisao": "Em revisão",
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
