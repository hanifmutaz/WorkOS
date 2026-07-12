-- WorkOS MVP Schema
-- Jalankan di Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- ============ WORKSPACES ============
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text default '📁',
  color text default '#38bdf8',
  created_at timestamptz default now()
);

alter table workspaces enable row level security;

create policy "workspaces_select_own" on workspaces
  for select using (auth.uid() = user_id);
create policy "workspaces_insert_own" on workspaces
  for insert with check (auth.uid() = user_id);
create policy "workspaces_update_own" on workspaces
  for update using (auth.uid() = user_id);
create policy "workspaces_delete_own" on workspaces
  for delete using (auth.uid() = user_id);

-- ============ PROJECTS ============
create table projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  status text default 'planning' check (status in ('planning','active','done','archived')),
  priority text default 'medium' check (priority in ('low','medium','high')),
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

alter table projects enable row level security;

create policy "projects_select_own" on projects
  for select using (
    exists (select 1 from workspaces w where w.id = workspace_id and w.user_id = auth.uid())
  );
create policy "projects_insert_own" on projects
  for insert with check (
    exists (select 1 from workspaces w where w.id = workspace_id and w.user_id = auth.uid())
  );
create policy "projects_update_own" on projects
  for update using (
    exists (select 1 from workspaces w where w.id = workspace_id and w.user_id = auth.uid())
  );
create policy "projects_delete_own" on projects
  for delete using (
    exists (select 1 from workspaces w where w.id = workspace_id and w.user_id = auth.uid())
  );

-- ============ TASKS ============
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo','in_progress','done')),
  priority text default 'medium' check (priority in ('low','medium','high')),
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "tasks_select_own" on tasks
  for select using (
    exists (
      select 1 from projects p
      join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );
create policy "tasks_insert_own" on tasks
  for insert with check (
    exists (
      select 1 from projects p
      join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );
create policy "tasks_update_own" on tasks
  for update using (
    exists (
      select 1 from projects p
      join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );
create policy "tasks_delete_own" on tasks
  for delete using (
    exists (
      select 1 from projects p
      join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );

-- ============ AUTO UPDATE updated_at ============
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- ============ INDEXES ============
create index idx_projects_workspace on projects(workspace_id);
create index idx_tasks_project on tasks(project_id);
create index idx_tasks_deadline on tasks(deadline);

-- ============ ACTIVITY LOGS ============
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('workspace','project','task')),
  entity_id uuid not null,
  entity_name text not null,
  action text not null check (action in ('created','updated','deleted','status_changed')),
  detail text,
  created_at timestamptz default now()
);

alter table activity_logs enable row level security;

create policy "activity_logs_select_own" on activity_logs
  for select using (auth.uid() = user_id);
create policy "activity_logs_insert_own" on activity_logs
  for insert with check (auth.uid() = user_id);

create index idx_activity_logs_user on activity_logs(user_id, created_at desc);

-- ============ TIME ENTRIES ============
create table time_entries (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table time_entries enable row level security;

create policy "time_entries_select_own" on time_entries
  for select using (auth.uid() = user_id);
create policy "time_entries_insert_own" on time_entries
  for insert with check (auth.uid() = user_id);
create policy "time_entries_update_own" on time_entries
  for update using (auth.uid() = user_id);
create policy "time_entries_delete_own" on time_entries
  for delete using (auth.uid() = user_id);

create index idx_time_entries_task on time_entries(task_id);
create index idx_time_entries_user_running on time_entries(user_id) where ended_at is null;

-- ============ MILESTONES ============
create table milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

alter table milestones enable row level security;

create policy "milestones_select_own" on milestones
  for select using (
    exists (
      select 1 from projects p
      join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );
create policy "milestones_insert_own" on milestones
  for insert with check (
    exists (
      select 1 from projects p
      join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );
create policy "milestones_delete_own" on milestones
  for delete using (
    exists (
      select 1 from projects p
      join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );

create index idx_milestones_project on milestones(project_id);

-- tasks bisa opsional masuk ke milestone
alter table tasks add column milestone_id uuid references milestones(id) on delete set null;
create index idx_tasks_milestone on tasks(milestone_id);

-- ============ ATTACHMENTS ============
create table attachments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz default now()
);

alter table attachments enable row level security;

create policy "attachments_select_own" on attachments
  for select using (auth.uid() = user_id);
create policy "attachments_insert_own" on attachments
  for insert with check (auth.uid() = user_id);
create policy "attachments_delete_own" on attachments
  for delete using (auth.uid() = user_id);

create index idx_attachments_task on attachments(task_id);

-- ============ STORAGE BUCKET ============
-- Bucket private, file disimpen dengan path: {user_id}/{task_id}/{filename}
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_storage_select_own" on storage.objects
  for select using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attachments_storage_insert_own" on storage.objects
  for insert with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attachments_storage_delete_own" on storage.objects
  for delete using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);