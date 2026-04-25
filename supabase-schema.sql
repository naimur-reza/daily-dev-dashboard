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



-- ============================================================
-- Job Digest + Application Tracker Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─── DAILY JOB DIGEST ────────────────────────────────────────
create table if not exists job_digest (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  date         date not null default current_date,
  job_id       text not null,
  title        text not null,
  company      text not null,
  location     text,
  url          text not null,
  salary       text,
  tags         text[],
  description  text,
  source       text default 'remoteok',
  ai_reason    text,
  created_at   timestamptz default now(),
  unique(user_id, date, job_id)
);

alter table job_digest enable row level security;
create policy "Users manage own job digest"
  on job_digest for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index job_digest_user_date_idx on job_digest(user_id, date);

-- ─── APPLICATION TRACKER ─────────────────────────────────────
create table if not exists job_applications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  company       text not null,
  role          text not null,
  location      text,
  url           text,
  salary        text,
  status        text not null default 'applied'
                check (status in ('saved','applied','interview','offer','rejected','ghosted')),
  applied_date  date default current_date,
  notes         text default '',
  tags          text[],
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table job_applications enable row level security;
create policy "Users manage own applications"
  on job_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index applications_user_status_idx on job_applications(user_id, status);
create index applications_user_date_idx on job_applications(user_id, applied_date);