-- ============================================================
-- AI Weekly Planner Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- User's life context (filled once, updated anytime)
create table if not exists planner_context (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null unique,
  job_start         time default '10:00',
  job_end           time default '17:00',
  work_days         text[] default array['Monday','Tuesday','Wednesday','Thursday','Friday'],
  peak_hours        text default '9am-12pm',
  goals             text[] default array[]::text[],
  weekly_study_hrs  integer default 10,
  weekly_project_hrs integer default 6,
  weekly_leisure_hrs integer default 8,
  learning_focus    text default 'balanced',
  extra_context     text default '',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table planner_context enable row level security;
create policy "Users manage own context"
  on planner_context for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Weekly generated schedules
create table if not exists weekly_plans (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  week_start  date not null,
  week_end    date not null,
  plan        jsonb not null default '[]',
  ai_summary  text default '',
  created_at  timestamptz default now(),
  unique(user_id, week_start)
);

alter table weekly_plans enable row level security;
create policy "Users manage own plans"
  on weekly_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index weekly_plans_user_idx on weekly_plans(user_id, week_start desc);

-- Daily task blocks (generated from weekly plan)
create table if not exists plan_blocks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  start_time  text not null,
  end_time    text not null,
  title       text not null,
  category    text not null, -- study | project | job | leisure | self | apply
  priority    text not null default 'medium', -- critical | high | medium | low
  notes       text default '',
  done        boolean default false,
  created_at  timestamptz default now()
);

alter table plan_blocks enable row level security;
create policy "Users manage own blocks"
  on plan_blocks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index plan_blocks_user_date_idx on plan_blocks(user_id, date);