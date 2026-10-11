import { formatEcts } from '@/lib/module';
import { formatSlot, normalizeSlots, slotLabel } from '@/lib/slots';
import type { ModuleRow } from '@/types/database';

/** @brief One row of the info card. */
interface InfoRow {
  term: string;
  value: string;
}

/**
 * @brief Builds the rows for a list of appointments ("Vorlesung 1", "Vorlesung 2", …).
 * @param kind Label base, e.g. "Vorlesung".
 * @param value Stored slot list.
 * @returns Info rows.
 */
function slotRows(kind: string, value: unknown): InfoRow[] {
  const slots = normalizeSlots(value);
  return slots.map((slot, index) => ({
    term: slotLabel(kind, index, slots.length),
    value: formatSlot(slot),
  }));
}

/**
 * @brief Module facts as an iOS-style card: professor, ECTS, all lectures and exercises.
 *        Empty fields are hidden.
 * @param props.module Module to describe.
 * @returns Large title plus info card.
 */
export function ModuleInfo({ module }: { module: ModuleRow }) {
  const rows: InfoRow[] = [
    ...(module.professor ? [{ term: 'Prof', value: module.professor }] : []),
    ...(module.ects !== null ? [{ term: 'ECTS', value: formatEcts(module.ects) }] : []),
    ...slotRows('Vorlesung', module.lectures),
    ...slotRows('Übung', module.exercises),
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight break-words hyphens-auto lg:text-[34px]">
        {module.name}
      </h1>
      {rows.length > 0 && (
        <dl className="card divide-separator divide-y-[0.5px]">
          {rows.map((row) => (
            <div
              key={row.term}
              className="flex min-h-11 items-baseline justify-between gap-4 px-4 py-2.5"
            >
              <dt className="text-label shrink-0 text-base">{row.term}</dt>
              <dd className="text-label-2 min-w-0 text-right text-base break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
