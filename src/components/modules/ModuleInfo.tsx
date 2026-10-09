import { formatEcts } from '@/lib/module';
import type { ModuleRow } from '@/types/database';

/**
 * @brief Joins room and time ("H-1.10 · Di 10:00–11:30"), skipping empty parts.
 * @param room Room or null.
 * @param time Time text or null.
 * @returns Combined text, or null if both are empty.
 */
function joinSlot(room: string | null, time: string | null): string | null {
  const parts = [room, time].filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(' · ') : null;
}

/**
 * @brief Module facts (name, professor, ECTS, lecture, exercise); empty fields are hidden.
 * @param props.module Module to describe.
 * @returns Heading plus definition list.
 */
export function ModuleInfo({ module }: { module: ModuleRow }) {
  const rows = [
    { term: 'Prof', value: module.professor },
    { term: 'ECTS', value: module.ects !== null ? formatEcts(module.ects) : null },
    { term: 'Vorlesung', value: joinSlot(module.lecture_room, module.lecture_time) },
    { term: 'Übung', value: joinSlot(module.exercise_room, module.exercise_time) },
  ].filter((row): row is { term: string; value: string } => Boolean(row.value));

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl leading-tight font-semibold tracking-tight break-words lg:text-3xl">
        {module.name}
      </h1>
      {rows.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
          {rows.map((row) => (
            <div key={row.term} className="contents">
              <dt className="text-gray-500">{row.term}</dt>
              <dd className="min-w-0 break-words text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
