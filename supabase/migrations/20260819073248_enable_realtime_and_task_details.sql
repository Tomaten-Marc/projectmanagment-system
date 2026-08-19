alter table public.tasks
add column implementation_details text;

comment on column public.tasks.implementation_details is
  'Detailed explanation of how the task is or will be implemented.';

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'work_packages',
    'tasks',
    'open_questions',
    'decisions',
    'stakeholders',
    'access_requests',
    'roadmap_items',
    'activity_log'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        table_name
      );
    end if;
  end loop;
end $$;
