-- Migration: Builder projects & messages tables
-- Run this in Supabase SQL editor

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Untitled Project',
  last_prompt text default '',
  file_tree jsonb default '{}',
  is_favorite boolean default false,
  last_saved timestamptz default now(),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  role text not null,
  text text default '',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Auto-update updated_at on projects
create or replace function update_projects_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
  before update on projects
  for each row execute function update_projects_updated_at();

-- RLS
alter table projects enable row level security;
alter table project_messages enable row level security;

drop policy if exists "users own projects" on projects;
create policy "users own projects" on projects
  for all using (auth.uid() = user_id);

drop policy if exists "users own project messages" on project_messages;
create policy "users own project messages" on project_messages
  for all using (
    project_id in (select id from projects where user_id = auth.uid())
  );
