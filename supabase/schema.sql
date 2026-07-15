-- Life OS — Supabaseスキーマ
-- Supabaseダッシュボードの SQL Editor に貼り付けて実行してください。
-- 実行は1回だけでOK（既存テーブルがある場合は先に確認してください）。

create extension if not exists pgcrypto;

-- =========================================================
-- goals
-- =========================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'done', 'archived')),
  priority text not null default 'P3' check (priority in ('P1', 'P2', 'P3', 'P4')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- projects
-- =========================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  goal_id uuid references public.goals(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'on_hold', 'done', 'archived')),
  priority text not null default 'P3' check (priority in ('P1', 'P2', 'P3', 'P4')),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- habits（tasks/morning_blocksから参照されるためtasksより先に作成）
-- =========================================================
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  goal_id uuid references public.goals(id) on delete set null,
  frequency jsonb not null default '{"type":"daily"}'::jsonb,
  time_of_day text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- tasks
-- =========================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  project_id uuid references public.projects(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'someday', 'waiting')),
  priority text not null default 'P3' check (priority in ('P1', 'P2', 'P3', 'P4')),
  due_date date,
  scheduled_date date,
  tags text[] not null default '{}',
  estimated_minutes int,
  habit_id uuid references public.habits(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- habit_logs
-- =========================================================
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  unique (habit_id, date)
);

-- =========================================================
-- inbox_items
-- =========================================================
create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- notes
-- =========================================================
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  type text not null default 'note' check (type in ('note', 'daily')),
  date date,
  linked_goal_id uuid references public.goals(id) on delete set null,
  linked_project_id uuid references public.projects(id) on delete set null,
  linked_task_id uuid references public.tasks(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- morning_blocks
-- =========================================================
create table if not exists public.morning_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  time text not null,
  title text not null,
  linked_habit_id uuid references public.habits(id) on delete set null,
  done boolean not null default false
);

-- =========================================================
-- インデックス
-- =========================================================
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_goal_id_idx on public.projects(goal_id);
create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_goal_id_idx on public.tasks(goal_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index if not exists inbox_items_user_id_idx on public.inbox_items(user_id);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists morning_blocks_user_id_idx on public.morning_blocks(user_id);
create index if not exists morning_blocks_date_idx on public.morning_blocks(date);

-- =========================================================
-- updated_at 自動更新トリガー
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_goals_updated_at before update on public.goals
  for each row execute function public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger set_habits_updated_at before update on public.habits
  for each row execute function public.set_updated_at();
create trigger set_tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger set_inbox_items_updated_at before update on public.inbox_items
  for each row execute function public.set_updated_at();
create trigger set_notes_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

-- =========================================================
-- RLS（各テーブルとも自分の行のみ読み書きできる）
-- =========================================================
alter table public.goals enable row level security;
alter table public.projects enable row level security;
alter table public.habits enable row level security;
alter table public.tasks enable row level security;
alter table public.habit_logs enable row level security;
alter table public.inbox_items enable row level security;
alter table public.notes enable row level security;
alter table public.morning_blocks enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'goals', 'projects', 'habits', 'tasks',
    'habit_logs', 'inbox_items', 'notes', 'morning_blocks'
  ]
  loop
    execute format(
      'create policy "select own %1$s" on public.%1$s for select using (auth.uid() = user_id)', t
    );
    execute format(
      'create policy "insert own %1$s" on public.%1$s for insert with check (auth.uid() = user_id)', t
    );
    execute format(
      'create policy "update own %1$s" on public.%1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t
    );
    execute format(
      'create policy "delete own %1$s" on public.%1$s for delete using (auth.uid() = user_id)', t
    );
  end loop;
end $$;

-- =========================================================
-- 追記（振り返り機能用）: プロジェクトの完了日時
-- 既存環境では、このALTER文だけをSQL Editorで実行すればよい
-- （スキーマ全体を再実行するとRLSポリシーが重複エラーになるため）
-- =========================================================
alter table public.projects add column if not exists completed_at timestamptz;

-- =========================================================
-- 追記（リンク管理機能用）: 仕事上よく開くURLの保存
-- 既存環境では、このブロックだけをSQL Editorで実行すればよい
-- =========================================================
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  category text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_user_id_idx on public.links(user_id);

create trigger set_links_updated_at before update on public.links
  for each row execute function public.set_updated_at();

alter table public.links enable row level security;

create policy "select own links" on public.links for select using (auth.uid() = user_id);
create policy "insert own links" on public.links for insert with check (auth.uid() = user_id);
create policy "update own links" on public.links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own links" on public.links for delete using (auth.uid() = user_id);
