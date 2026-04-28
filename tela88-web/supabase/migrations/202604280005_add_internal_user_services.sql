create table if not exists public.internal_user_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.internal_users(id) on delete cascade,
  service_id public.service_id not null,
  created_at timestamptz not null default now(),
  unique (user_id, service_id)
);

create index if not exists internal_user_services_user_id_idx
  on public.internal_user_services(user_id);
