-- =============================================================================
-- Uni-App – multiple lectures and exercises per module
--
-- Run once in the Supabase SQL editor AFTER 20261010000000_init.sql.
-- Replaces the single lecture/exercise columns by JSON lists of { room, time }
-- and moves existing values into the new lists. Runs as one transaction.
-- =============================================================================

begin;

alter table public.modules
  add column lectures jsonb not null default '[]'::jsonb
    check (jsonb_typeof(lectures) = 'array'),
  add column exercises jsonb not null default '[]'::jsonb
    check (jsonb_typeof(exercises) = 'array');

-- Keep existing data: one entry per module that had a room or a time.
update public.modules
set lectures = jsonb_build_array(
  jsonb_build_object('room', coalesce(lecture_room, ''), 'time', coalesce(lecture_time, ''))
)
where lecture_room is not null or lecture_time is not null;

update public.modules
set exercises = jsonb_build_array(
  jsonb_build_object('room', coalesce(exercise_room, ''), 'time', coalesce(exercise_time, ''))
)
where exercise_room is not null or exercise_time is not null;

alter table public.modules
  drop column lecture_room,
  drop column lecture_time,
  drop column exercise_room,
  drop column exercise_time;

commit;
