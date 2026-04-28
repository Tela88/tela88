create table if not exists public.service_subservices (
  id uuid primary key default gen_random_uuid(),
  service_id public.service_id not null,
  slug text not null,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, slug)
);

create index if not exists service_subservices_service_id_idx on public.service_subservices(service_id);

alter table public.team_tasks
  add column if not exists sub_service_id uuid references public.service_subservices(id) on delete set null;

create index if not exists team_tasks_sub_service_id_idx on public.team_tasks(sub_service_id);

insert into public.service_subservices (service_id, slug, name, description)
values
  ('websites-crm', 'landing-page', 'Landing page', 'Página de conversão para campanhas, serviços ou ofertas específicas.'),
  ('websites-crm', 'website-institucional', 'Website institucional', 'Estrutura principal do site da marca com páginas base.'),
  ('websites-crm', 'crm-pipeline', 'CRM e pipeline', 'Configuração do funil comercial, etapas e gestão de leads.'),
  ('websites-crm', 'automacoes', 'Automações', 'Automação de respostas, formulários e passagens de estado.'),

  ('anuncios-trafego-organico', 'meta-ads', 'Meta Ads', 'Campanhas, conjuntos, anúncios e otimização contínua.'),
  ('anuncios-trafego-organico', 'google-ads', 'Google Ads', 'Pesquisa, display e remarketing com foco em intenção.'),
  ('anuncios-trafego-organico', 'seo-conteudo', 'SEO e conteúdo', 'Planeamento editorial, páginas e melhoria orgânica.'),
  ('anuncios-trafego-organico', 'tracking-analytics', 'Tracking e analytics', 'Pixels, eventos, UTMs e leitura de performance.'),

  ('funis-conversao', 'lead-magnet', 'Lead magnet', 'Oferta de entrada para captar contactos com contexto.'),
  ('funis-conversao', 'email-sequence', 'Sequência de email', 'Fluxos de nutrição, follow-up e ativação de leads.'),
  ('funis-conversao', 'whatsapp-flow', 'Fluxo WhatsApp', 'Sequências e automação de contacto via WhatsApp.'),
  ('funis-conversao', 'sales-page', 'Página de vendas', 'Estrutura de conversão para oferta, pack ou campanha.'),

  ('consultoria-marketing', 'auditoria', 'Auditoria', 'Leitura do contexto atual e prioridades estratégicas.'),
  ('consultoria-marketing', 'plano-mensal', 'Plano mensal', 'Plano de ação mensal, prioridades e acompanhamento.'),
  ('consultoria-marketing', 'posicionamento', 'Posicionamento', 'Clareza de oferta, mensagem e proposta de valor.'),
  ('consultoria-marketing', 'reuniao-estrategica', 'Reunião estratégica', 'Sessão de alinhamento, decisão e próximos passos.'),

  ('design-grafico', 'criativos-ads', 'Criativos para anúncios', 'Peças estáticas e variações para campanhas pagas.'),
  ('design-grafico', 'social-posts', 'Peças para social', 'Design para feed, stories, reels covers e séries.'),
  ('design-grafico', 'branding-assets', 'Assets de branding', 'Templates, apresentações e materiais visuais da marca.'),
  ('design-grafico', 'edicao-imagem', 'Edição de imagem', 'Tratamento, adaptação e variações de imagem.'),

  ('gestao-redes-sociais', 'calendario-editorial', 'Calendário editorial', 'Planeamento mensal e ritmo de conteúdos.'),
  ('gestao-redes-sociais', 'copywriting', 'Copywriting', 'Legendas, ganchos e estrutura textual das peças.'),
  ('gestao-redes-sociais', 'publicacao', 'Publicação e gestão', 'Subida dos conteúdos e gestão operacional do canal.'),
  ('gestao-redes-sociais', 'community-management', 'Community management', 'Interação, respostas e acompanhamento de comunidade')
on conflict (service_id, slug) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();
