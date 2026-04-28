alter table public.internal_users
  add column if not exists avatar_url text;
