create table if not exists public.services (
  id text primary key,
  label text not null,
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.services (id, label, summary)
values
  ('websites-crm', 'Websites e CRM', 'Plataformas, landing pages, CRM e automacoes base.'),
  ('anuncios-trafego-organico', 'Anuncios e Trafego Organico', 'Aquisicao paga, SEO editorial e performance continua.'),
  ('funis-conversao', 'Funis de Conversao', 'Captacao, nurturing e sequencias para fechar mais leads.'),
  ('consultoria-marketing', 'Consultoria de Marketing', 'Planeamento, posicionamento e direcao estrategica.'),
  ('design-grafico', 'Design Grafico', 'Pecas visuais, criativos e identidade aplicada ao digital.'),
  ('gestao-redes-sociais', 'Gestao de Redes Sociais', 'Calendario, publicacao e acompanhamento editorial.')
on conflict (id) do update
set
  label = excluded.label,
  summary = excluded.summary,
  updated_at = now();

alter table public.client_services
  alter column service_id type text using service_id::text;

alter table public.team_tasks
  alter column service_id type text using service_id::text;

alter table public.service_subservices
  alter column service_id type text using service_id::text;

alter table public.internal_user_services
  alter column service_id type text using service_id::text;

alter table public.client_services
  drop constraint if exists client_services_service_id_fkey;

alter table public.client_services
  add constraint client_services_service_id_fkey
  foreign key (service_id) references public.services(id) on delete cascade;

alter table public.team_tasks
  drop constraint if exists team_tasks_service_id_fkey;

alter table public.team_tasks
  add constraint team_tasks_service_id_fkey
  foreign key (service_id) references public.services(id) on delete set null;

alter table public.service_subservices
  drop constraint if exists service_subservices_service_id_fkey;

alter table public.service_subservices
  add constraint service_subservices_service_id_fkey
  foreign key (service_id) references public.services(id) on delete cascade;

alter table public.internal_user_services
  drop constraint if exists internal_user_services_service_id_fkey;

alter table public.internal_user_services
  add constraint internal_user_services_service_id_fkey
  foreign key (service_id) references public.services(id) on delete cascade;

create index if not exists client_services_service_id_idx on public.client_services(service_id);
create index if not exists team_tasks_service_id_idx on public.team_tasks(service_id);
create index if not exists service_subservices_service_id_idx on public.service_subservices(service_id);
create index if not exists internal_user_services_service_id_idx on public.internal_user_services(service_id);
