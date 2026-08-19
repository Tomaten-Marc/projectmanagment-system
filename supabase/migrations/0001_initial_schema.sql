begin;

create extension if not exists pgcrypto;

create table public.work_packages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^AP[0-9]+$'),
  title text not null,
  description text,
  status text not null default 'active',
  progress integer not null default 0 check (progress between 0 and 100),
  owner text,
  scope text,
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stakeholders (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  organizational_unit text,
  role text,
  responsibility text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references public.work_packages(id) on delete cascade,
  task_code text not null unique,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','waiting','in_progress','blocked','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  blocking boolean not null default false,
  responsible text,
  dependency text,
  due_date date,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.open_questions (
  id uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references public.work_packages(id) on delete cascade,
  question_code text not null unique,
  question text not null,
  stakeholder_id uuid references public.stakeholders(id) on delete set null,
  blocking boolean not null default false,
  status text not null default 'not_asked' check (status in ('not_asked','asked','answered','obsolete')),
  asked_at timestamptz,
  answered_at timestamptz,
  answer text,
  next_action text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references public.work_packages(id) on delete cascade,
  decision_code text not null unique,
  title text not null,
  description text,
  options jsonb,
  status text not null default 'open' check (status in ('open','pending','decided')),
  selected_option text,
  dependent_on text,
  decided_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references public.work_packages(id) on delete cascade,
  system_name text not null,
  description text,
  status text not null default 'unknown' check (status in ('unknown','required','requested','granted','rejected','not_required')),
  responsible text,
  requested_at timestamptz,
  granted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references public.work_packages(id) on delete cascade,
  title text not null,
  description text,
  week_number integer check (week_number between 1 and 53),
  start_date date,
  end_date date,
  status text not null default 'planned',
  dependency text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  work_package_id uuid references public.work_packages(id) on delete set null,
  entity_type text,
  entity_id uuid,
  summary text not null,
  details jsonb,
  source text not null default 'web_app' check (source in ('web_app','chatgpt','codex','manual','meeting','email'))
);

create index tasks_work_package_status_idx on public.tasks(work_package_id, status);
create index tasks_priority_blocking_idx on public.tasks(priority, blocking);
create index questions_work_package_status_idx on public.open_questions(work_package_id, status);
create index decisions_work_package_status_idx on public.decisions(work_package_id, status);
create index access_work_package_status_idx on public.access_requests(work_package_id, status);
create index roadmap_work_package_dates_idx on public.roadmap_items(work_package_id, start_date, end_date);
create index activity_created_at_idx on public.activity_log(created_at desc);
create index activity_work_package_idx on public.activity_log(work_package_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['work_packages','tasks','open_questions','decisions','stakeholders','access_requests','roadmap_items']
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

alter table public.work_packages enable row level security;
alter table public.tasks enable row level security;
alter table public.open_questions enable row level security;
alter table public.decisions enable row level security;
alter table public.stakeholders enable row level security;
alter table public.access_requests enable row level security;
alter table public.roadmap_items enable row level security;
alter table public.activity_log enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['work_packages','tasks','open_questions','decisions','stakeholders','access_requests','roadmap_items','activity_log']
  loop
    execute format('create policy "authenticated_select_%1$s" on public.%1$I for select to authenticated using ((select auth.uid()) is not null)', table_name);
    execute format('create policy "authenticated_insert_%1$s" on public.%1$I for insert to authenticated with check ((select auth.uid()) is not null)', table_name);
    execute format('create policy "authenticated_update_%1$s" on public.%1$I for update to authenticated using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null)', table_name);
    execute format('create policy "authenticated_delete_%1$s" on public.%1$I for delete to authenticated using ((select auth.uid()) is not null)', table_name);
  end loop;
end $$;

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

commit;