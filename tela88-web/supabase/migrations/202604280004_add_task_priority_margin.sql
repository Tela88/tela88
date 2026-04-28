alter table public.team_tasks
  add column if not exists priority_margin_days integer;
