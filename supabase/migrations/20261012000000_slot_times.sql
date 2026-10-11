-- =============================================================================
-- Uni-App – structured lecture / exercise times (step 1 of 2)
--
-- Run once in the Supabase SQL editor AFTER 20261011000000_module_slots.sql.
-- Every entry of `modules.lectures` / `modules.exercises` gets three new keys:
--   weekday     1 = Monday … 7 = Sunday (ISO)
--   start_time  "HH:MM"
--   end_time    "HH:MM", later than start_time
-- Existing free-text times ("Di 10:00–11:30") are parsed into these keys. The old
-- `time` text is kept for now; entries that could not be parsed keep the new keys
-- as null. Check them with the query at the end of this file, then run
-- 20261013000000_slot_times_cleanup.sql. Runs as one transaction.
-- =============================================================================

begin;

-- Validates a slot list. Every entry is an object with a string room and either
-- a complete, valid time (weekday + start + end) or – unless require_complete –
-- no time at all (legacy entry that still has to be fixed in the app).
create or replace function public.time_slots_valid(slots jsonb, require_complete boolean)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(slots) = 'array' and not exists (
    select 1
    from jsonb_array_elements(slots) as s(e)
    where not coalesce(
      jsonb_typeof(e) = 'object'
      and jsonb_typeof(coalesce(e -> 'room', '""')) = 'string'
      and (
        (
          not require_complete
          and coalesce(e -> 'weekday', 'null') = 'null'
          and coalesce(e -> 'start_time', 'null') = 'null'
          and coalesce(e -> 'end_time', 'null') = 'null'
        )
        or (
          jsonb_typeof(e -> 'weekday') = 'number'
          and (e ->> 'weekday') in ('1', '2', '3', '4', '5', '6', '7')
          and jsonb_typeof(e -> 'start_time') = 'string'
          and jsonb_typeof(e -> 'end_time') = 'string'
          and (e ->> 'start_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
          and (e ->> 'end_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
          and (e ->> 'end_time') > (e ->> 'start_time')
        )
      ),
      false
    )
  );
$$;

-- Parses "<Mo|Di|Mi|Do|Fr|Sa|So> HH:MM–HH:MM" (hyphen or dash, spaces optional,
-- "Uhr" and a dot after the weekday tolerated). Temporary: dropped at commit.
create function pg_temp.parse_slot(slot jsonb)
returns jsonb
language plpgsql
as $$
declare
  m text[];
  start_t text;
  end_t text;
begin
  m := regexp_match(
    coalesce(slot ->> 'time', ''),
    '^\s*(mo|di|mi|do|fr|sa|so)\.?,?\s*(\d{1,2})[:.](\d{2})\s*(?:uhr)?\s*[-–—]\s*(\d{1,2})[:.](\d{2})\s*(?:uhr)?\s*$',
    'i'
  );
  if m is not null
    and m[2]::int < 24 and m[3]::int < 60 and m[4]::int < 24 and m[5]::int < 60
  then
    start_t := lpad(m[2], 2, '0') || ':' || m[3];
    end_t := lpad(m[4], 2, '0') || ':' || m[5];
    if end_t > start_t then
      return slot || jsonb_build_object(
        'weekday', array_position(array['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'], lower(m[1])),
        'start_time', start_t,
        'end_time', end_t
      );
    end if;
  end if;
  return slot || '{"weekday": null, "start_time": null, "end_time": null}'::jsonb;
end;
$$;

update public.modules
set
  lectures = (
    select coalesce(jsonb_agg(pg_temp.parse_slot(t.e) order by t.ord), '[]'::jsonb)
    from jsonb_array_elements(lectures) with ordinality as t(e, ord)
  ),
  exercises = (
    select coalesce(jsonb_agg(pg_temp.parse_slot(t.e) order by t.ord), '[]'::jsonb)
    from jsonb_array_elements(exercises) with ordinality as t(e, ord)
  );

alter table public.modules
  add constraint modules_lectures_valid check (public.time_slots_valid(lectures, false)),
  add constraint modules_exercises_valid check (public.time_slots_valid(exercises, false));

commit;

-- -----------------------------------------------------------------------------
-- Check afterwards – lists every entry that could not be converted
-- (no rows = everything was converted):
--
--   select m.name as modul, s.art, s.e ->> 'room' as raum, s.e ->> 'time' as bisher
--   from public.modules m
--   cross join lateral (
--     select 'Vorlesung' as art, e from jsonb_array_elements(m.lectures) e
--     union all
--     select 'Übung', e from jsonb_array_elements(m.exercises) e
--   ) s
--   where s.e ->> 'weekday' is null
--   order by m.name;
-- -----------------------------------------------------------------------------
