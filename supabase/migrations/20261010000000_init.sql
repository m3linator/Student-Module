-- =============================================================================
-- Uni-App – initial schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Creates all tables, enables Row Level Security with owner-only policies and
-- adds every table to the Realtime publication.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: keep updated_at current
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- modules
-- -----------------------------------------------------------------------------
create table public.modules (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  name          text not null check (char_length(trim(name)) > 0),
  professor     text,
  ects          numeric check (ects >= 0),
  lecture_room  text,
  lecture_time  text,
  exercise_room text,
  exercise_time text,
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Allows composite foreign keys below so rows can only reference modules of the same user.
  unique (id, user_id)
);

create index modules_user_id_idx on public.modules (user_id);

create trigger modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- module_links
-- -----------------------------------------------------------------------------
create table public.module_links (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  module_id  uuid not null,
  title      text not null check (char_length(trim(title)) > 0),
  url        text not null check (char_length(trim(url)) > 0),
  position   int not null default 0,
  created_at timestamptz not null default now(),
  foreign key (module_id, user_id) references public.modules (id, user_id) on delete cascade
);

create index module_links_module_id_idx on public.module_links (module_id, position);
create index module_links_user_id_idx on public.module_links (user_id);

-- -----------------------------------------------------------------------------
-- tasks
-- -----------------------------------------------------------------------------
create table public.tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users on delete cascade,
  title             text not null check (char_length(trim(title)) > 0),
  due_date          date,
  finish_day_before boolean not null default true,
  module_id         uuid,
  completed_at      timestamptz,            -- null = open
  created_at        timestamptz not null default now(),
  -- Deleting a module keeps its tasks but clears only module_id (PostgreSQL 15+).
  foreign key (module_id, user_id) references public.modules (id, user_id) on delete set null (module_id)
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_module_id_idx on public.tasks (module_id);

-- -----------------------------------------------------------------------------
-- habits (exactly one per user)
-- -----------------------------------------------------------------------------
create table public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  name       text not null default 'Fokus' check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (user_id),
  unique (id, user_id)
);

-- -----------------------------------------------------------------------------
-- habit_checks
-- -----------------------------------------------------------------------------
create table public.habit_checks (
  habit_id uuid not null,
  user_id  uuid not null default auth.uid() references auth.users on delete cascade,
  date     date not null,
  primary key (habit_id, date),
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);

create index habit_checks_user_id_idx on public.habit_checks (user_id);

-- -----------------------------------------------------------------------------
-- Row Level Security: every user only sees and changes their own rows
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['modules', 'module_links', 'tasks', 'habits', 'habit_checks'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      t || '_delete_own', t);

    -- Realtime: send complete rows on update/delete and publish the table.
    execute format('alter table public.%I replica identity full', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end;
$$;
