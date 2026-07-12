# WorkOS — Starter

Next.js 15 (App Router) + Supabase. Tema dark navy sama kayak NOXOMOR.

## Setup

1. Extract project ini, terus:
   ```
   npm install
   ```

2. Bikin project baru di [supabase.com](https://supabase.com), copy URL & anon key.

3. Copy `.env.local.example` jadi `.env.local`, isi dengan credentials Supabase lu.

4. Buka Supabase SQL Editor, jalankan isi `supabase/schema.sql` — ini bikin 3 tabel
   (workspaces, projects, tasks) lengkap sama RLS policy jadi setiap user cuma bisa
   akses data dia sendiri.

5. Jalankan dev server:
   ```
   npm run dev
   ```

6. Bikin user pertama lewat Supabase Auth dashboard (atau bikin halaman signup sendiri
   — belum ada di starter ini, sengaja, biar lu yang bikin manual dulu satu akun testing).

## Struktur

```
app/
  (auth)/login/          -> halaman login
  (dashboard)/dashboard/  -> dashboard utama, fetch workspace + task terdekat
lib/supabase/
  client.ts    -> dipakai di client component
  server.ts    -> dipakai di server component / route handler
  middleware.ts -> refresh session + redirect ke /login kalau belum auth
supabase/
  schema.sql   -> jalankan sekali di SQL editor
```

## Status: MVP Phase 1 + Activity Log + Time Tracking + Report/Export + Polish + Milestone 🎉

- **Auth**: login + signup + session refresh via middleware
- **Sidebar**: navigasi Dashboard/Workspaces/Reports + logout
- **Workspace / Project / Task**: CRUD lengkap semua
- **Milestone**: bikin milestone per project (mis. Planning, Backend, Frontend), task bisa
  di-assign ke milestone pas dibuat, tampilan project detail otomatis ngelompokin task per
  milestone + progress (X/Y task selesai). Task tanpa milestone tetep muncul di grup terpisah.
- **Activity Log**: setiap create/update/delete/toggle status otomatis kecatat, muncul
  di dashboard sebagai feed "Aktivitas terakhir"
- **Time Tracking**: tombol Start/Stop di tiap task, timer live, cuma 1 timer aktif
  dalam satu waktu (opsional — kalau ga dipake, ga ngaruh ke fitur lain)
- **Reports** (`/reports`): stat cards, breakdown per workspace, Export CSV
- **Dashboard**: workspace list, deadline terdekat (toggle langsung), activity feed
- **Polish**: loading skeleton di semua halaman, error boundary dengan tombol "Coba lagi",
  toast notifikasi pas berhasil/gagal create/update/delete

## ⚠️ Migration kalau lu udah pernah setup sebelumnya

Tabel `milestones` baru, dan tabel `tasks` dapet kolom baru `milestone_id`. Jalanin ini
di SQL Editor (skip kalau setup baru — udah termasuk di `schema.sql` full):

```sql
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
    exists (select 1 from projects p join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid())
  );
create policy "milestones_insert_own" on milestones
  for insert with check (
    exists (select 1 from projects p join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid())
  );
create policy "milestones_delete_own" on milestones
  for delete using (
    exists (select 1 from projects p join workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid())
  );

create index idx_milestones_project on milestones(project_id);

alter table tasks add column milestone_id uuid references milestones(id) on delete set null;
create index idx_tasks_milestone on tasks(milestone_id);
```

## ⚠️ Kalau lu udah pernah jalanin schema.sql sebelumnya

Ada 2 tabel baru: `activity_logs` dan `time_entries`. Jangan run ulang seluruh
`schema.sql`. Jalanin migration ini di SQL Editor kalau belum:

```sql
-- skip kalau activity_logs udah ada dari sebelumnya
create table if not exists activity_logs (
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
create index if not exists idx_activity_logs_user on activity_logs(user_id, created_at desc);

-- time_entries
create table if not exists time_entries (
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
create index if not exists idx_time_entries_task on time_entries(task_id);
```

Kalau ini setup baru, jalanin `schema.sql` full seperti biasa, udah termasuk 2 tabel ini.

## Yang belum ada (backlog)

- Attachment (butuh setup Supabase Storage bucket manual dulu di dashboard)
- Reorder milestone/task via drag & drop (sekarang urutan fix berdasarkan created_at/position)

## Cara pakai setelah setup

1. Buka `/signup`, bikin akun baru (atau lewat Supabase Auth dashboard kalau mau skip
   email confirmation)
2. Login di `/login`
3. Sidebar → Workspaces → bikin workspace pertama
4. Klik workspace → bikin project
5. Klik project → bikin task, klik judul task buat ganti status
6. Sidebar → Dashboard → lihat ringkasan, bisa toggle task langsung dari situ