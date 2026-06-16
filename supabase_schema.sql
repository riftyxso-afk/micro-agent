-- =============================================
-- MicroAgent Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Chat Sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text default 'New Chat',
  model_id text default '',
  room text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Chat Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  text text default '',
  model_id text default '',
  search_mode text default '',
  skill_slug text,
  effort_level text default '',
  image_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- 3. Skill Installs per User
create table if not exists skill_installs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  skill_slug text not null,
  source text default '',
  installed_at timestamptz default now(),
  unique(user_id, skill_slug)
);

-- 4. Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id text unique not null,
  plan text not null default 'free' check (plan in ('free','pro','ultra')),
  billing text default 'monthly' check (billing in ('monthly','yearly')),
  amount_idr bigint default 0,
  credits integer default 50,
  status text not null default 'pending' check (status in ('pending','active','cancelled','failed')),
  created_at timestamptz default now(),
  activated_at timestamptz
);

-- =============================================
-- Row Level Security
-- =============================================

alter table sessions enable row level security;
alter table messages enable row level security;
alter table skill_installs enable row level security;
alter table subscriptions enable row level security;

create policy "users own sessions"
  on sessions for all
  using (auth.uid() = user_id);

create policy "users own messages"
  on messages for all
  using (
    session_id in (
      select id from sessions where user_id = auth.uid()
    )
  );

create policy "users own installs"
  on skill_installs for all
  using (auth.uid() = user_id);

create policy "users own subscriptions"
  on subscriptions for all
  using (auth.uid() = user_id);

-- =============================================
-- Indexes
-- =============================================

create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_messages_session on messages(session_id);
create index if not exists idx_skill_installs_user on skill_installs(user_id);
create index if not exists idx_subscriptions_user on subscriptions(user_id, status);
create index if not exists idx_subscriptions_order on subscriptions(order_id);

-- =============================================
-- Realtime
-- =============================================

alter publication supabase_realtime add table subscriptions;
alter publication supabase_realtime add table sessions;
