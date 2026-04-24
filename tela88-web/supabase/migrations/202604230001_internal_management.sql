create extension if not exists pgcrypto;

do $$
begin
  create type public.internal_user_role as enum ('admin', 'collaborator');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.internal_user_status as enum ('disponivel', 'ocupado', 'offline');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.request_status as enum ('pending', 'agendado', 'atendido', 'cliente', 'fechado');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.client_stage as enum ('em-processo', 'em-producao');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.service_id as enum (
    'websites-crm',
    'anuncios-trafego-organico',
    'funis-conversao',
    'consultoria-marketing',
    'design-grafico',
    'gestao-redes-sociais'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.service_delivery_stage as enum ('planeado', 'em-processo', 'em-producao', 'concluido');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('hoje', 'em-curso', 'em-revisao', 'feito');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('alta', 'media', 'baixa');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.internal_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  name text not null,
  role public.internal_user_role not null default 'collaborator',
  function_role text not null default '',
  status public.internal_user_status not null default 'disponivel',
  daily_capacity text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null default '',
  revenue text not null default '',
  challenge text not null default '',
  focus_area text not null default '',
  status public.request_status not null default 'pending',
  scheduled_at timestamptz,
  internal_notes text not null default '',
  client_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.consultation_requests(id) on delete set null,
  name text not null,
  email text not null,
  company text not null default '',
  revenue text not null default '',
  challenge text not null default '',
  focus_area text not null default '',
  client_stage public.client_stage not null default 'em-processo',
  pack_name text not null default '',
  pack_description text not null default '',
  setup_fee text not null default '',
  monthly_fee text not null default '',
  internal_notes text not null default '',
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.consultation_requests
  drop constraint if exists consultation_requests_client_id_fkey;

alter table public.consultation_requests
  add constraint consultation_requests_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;

create table if not exists public.client_services (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  service_id public.service_id not null,
  stage public.service_delivery_stage not null default 'planeado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, service_id)
);

create table if not exists public.team_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status public.task_status not null default 'hoje',
  priority public.task_priority not null default 'media',
  assignee_id uuid references public.internal_users(id) on delete set null,
  due_date date,
  client_id uuid references public.clients(id) on delete set null,
  service_id public.service_id,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consultation_requests_status_idx on public.consultation_requests(status);
create index if not exists clients_client_stage_idx on public.clients(client_stage);
create index if not exists client_services_client_id_idx on public.client_services(client_id);
create index if not exists team_tasks_assignee_id_idx on public.team_tasks(assignee_id);
create index if not exists team_tasks_client_id_idx on public.team_tasks(client_id);
create index if not exists team_tasks_status_idx on public.team_tasks(status);

insert into public.internal_users (
  id,
  username,
  email,
  name,
  role,
  function_role,
  status,
  daily_capacity,
  password_hash
) values
  (
    '00000000-0000-4000-8000-000000000001',
    'admin',
    'admin@tela88.pt',
    'Admin Tela88',
    'admin',
    'Direcao',
    'disponivel',
    'Gestao total',
    'scrypt$d0161277ad3d0a3197d9622c59393486$b8a2539039d3d584c9736d08de6973d9f4cee1a509811faed9cbb96cb03ad5031567e4977f32185e00af76efbd22c63f5ea6993c1451f1dfb0a9cc61249c6460'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'tiago',
    'tiago@tela88.pt',
    'Tiago Carvalho',
    'collaborator',
    'Direcao criativa e estrategia',
    'disponivel',
    '5h livres hoje',
    'scrypt$e4b1661cd1b596d95c297341d9f2dfc0$85198c82f68f7651677c358b4d9a5113ae18937c9266e2b19b670d0a9607b31dbbfb4acc3361fd75a4fba61dcad3f33e156aa6f90fb879fac21a86c55d73b7b6'
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'mariana',
    'mariana@tela88.pt',
    'Mariana Costa',
    'collaborator',
    'Gestao de projeto',
    'disponivel',
    '5h livres hoje',
    'scrypt$398e2643052c6b0f5aa1d568d2ab5e38$163bdd3fb73d6e29dc9d2a4e7d2e19182bec61f85aeaf225d2c7a3505bfec1ab078dda8bb8caf2ef3ba2ca0f403dc968a1c5e5e872938486d79fb52f24dbb053'
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    'pedro',
    'pedro@tela88.pt',
    'Pedro Martins',
    'collaborator',
    'Paid media',
    'disponivel',
    '4h livres hoje',
    'scrypt$56b68c44bd710a0521cf4f48da2ae824$15ba9c37c2db008adef355c8fa949b766ff44d9d718b930a8e26f1a5e05a58b20e9dbf34d12454623040078002ffdbc0a148701be49011496e3577c98ff480c0'
  ),
  (
    '00000000-0000-4000-8000-000000000005',
    'sofia',
    'sofia@tela88.pt',
    'Sofia Almeida',
    'collaborator',
    'Design e social',
    'disponivel',
    '4h livres hoje',
    'scrypt$c3c09786257ad8cf0fc869a39ceb2998$028c72c79f7072de4c9a489198a36d8e7239cad107197f7c39071694e9af75636ebd7038b022b80d42e0f73be1ea80e9f1aab4c4b3298defd2bd8d515db9540e'
  )
on conflict (username) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role,
  function_role = excluded.function_role,
  status = excluded.status,
  daily_capacity = excluded.daily_capacity,
  password_hash = excluded.password_hash,
  updated_at = now();
