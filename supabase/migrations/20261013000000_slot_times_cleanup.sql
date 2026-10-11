-- =============================================================================
-- Uni-App – structured lecture / exercise times (step 2 of 2)
--
-- Run ONLY after 20261012000000_slot_times.sql AND after the check query in that
-- file returns no rows (fix or delete the listed entries in the app first).
-- Removes the old free-text `time` key and makes weekday / start / end required.
-- Aborts without changing anything while an entry is still incomplete.
-- =============================================================================

-- Safety check first (outside the transaction, so an abort leaves nothing open).
do $$
declare
  open_count int;
begin
  select count(*) into open_count
  from public.modules m
  cross join lateral jsonb_array_elements(m.lectures || m.exercises) as s(e)
  where s.e ->> 'weekday' is null
    or s.e ->> 'start_time' is null
    or s.e ->> 'end_time' is null;
  if open_count > 0 then
    raise exception '% Termin(e) ohne Wochentag, Beginn oder Ende – bitte zuerst in der App korrigieren.',
      open_count;
  end if;
end;
$$;

begin;

update public.modules
set
  lectures = (
    select coalesce(jsonb_agg(t.e - 'time' order by t.ord), '[]'::jsonb)
    from jsonb_array_elements(lectures) with ordinality as t(e, ord)
  ),
  exercises = (
    select coalesce(jsonb_agg(t.e - 'time' order by t.ord), '[]'::jsonb)
    from jsonb_array_elements(exercises) with ordinality as t(e, ord)
  )
where lectures::text like '%"time"%' or exercises::text like '%"time"%';

alter table public.modules
  drop constraint modules_lectures_valid,
  drop constraint modules_exercises_valid,
  add constraint modules_lectures_valid check (public.time_slots_valid(lectures, true)),
  add constraint modules_exercises_valid check (public.time_slots_valid(exercises, true));

commit;
