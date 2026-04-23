-- ============================================================
-- Dev Daily Dashboard — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── TASKS ───────────────────────────────────────────────────
create table if not exists tasks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  done       boolean default false,
  tag        text,
  date       date not null default current_date,
  created_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users can manage their own tasks"
  on tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index tasks_user_date_idx on tasks(user_id, date);

-- ─── JOURNAL ENTRIES ─────────────────────────────────────────
create table if not exists journal_entries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null default current_date,
  built      text default '',
  blocked    text default '',
  next       text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table journal_entries enable row level security;

create policy "Users can manage their own journal"
  on journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index journal_user_date_idx on journal_entries(user_id, date);

-- ─── HABIT LOGS ──────────────────────────────────────────────
create table if not exists habit_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null default current_date,
  coded      boolean default true,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table habit_logs enable row level security;

create policy "Users can manage their own habits"
  on habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index habit_user_date_idx on habit_logs(user_id, date);

-- ─── POMODORO SESSIONS ───────────────────────────────────────
create table if not exists pomodoro_sessions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null default current_date,
  minutes    integer default 25,
  created_at timestamptz default now()
);

alter table pomodoro_sessions enable row level security;

create policy "Users can manage their own pomodoro sessions"
  on pomodoro_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index pomodoro_user_date_idx on pomodoro_sessions(user_id, date);
