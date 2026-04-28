update public.client_services
set stage = 'planeado'
where stage = 'em-processo';

create type public.task_status_new as enum ('planeamento', 'hoje', 'em-curso', 'em-revisao', 'feito');

alter table public.team_tasks
  alter column status drop default;

alter table public.team_tasks
  alter column status type public.task_status_new
  using status::text::public.task_status_new;

alter table public.team_tasks
  alter column status set default 'planeamento';

drop type public.task_status;
alter type public.task_status_new rename to task_status;

create type public.client_stage_new as enum ('planeamento', 'em-producao');

alter table public.clients
  alter column client_stage drop default;

alter table public.clients
  alter column client_stage type public.client_stage_new
  using (
    case
      when client_stage::text = 'em-processo' then 'planeamento'
      else client_stage::text
    end
  )::public.client_stage_new;

alter table public.clients
  alter column client_stage set default 'planeamento';

drop type public.client_stage;
alter type public.client_stage_new rename to client_stage;

create type public.service_delivery_stage_new as enum ('planeado', 'em-producao', 'concluido');

alter table public.client_services
  alter column stage drop default;

alter table public.client_services
  alter column stage type public.service_delivery_stage_new
  using (
    case
      when stage::text = 'em-processo' then 'planeado'
      else stage::text
    end
  )::public.service_delivery_stage_new;

alter table public.client_services
  alter column stage set default 'planeado';

drop type public.service_delivery_stage;
alter type public.service_delivery_stage_new rename to service_delivery_stage;
