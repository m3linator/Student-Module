import { MapPinIcon } from '@/components/ui/icons';
import { formatEcts } from '@/lib/module';
import {
  formatSlotTime,
  isCompleteSlot,
  moduleAppointments,
  SLOT_KIND_LABELS,
  type Appointment,
} from '@/lib/slots';
import type { ModuleRow } from '@/types/database';

/** @brief Shared classes of one card row. */
const ROW = 'flex min-h-11 px-4 py-2.5 text-base';

/**
 * @brief One appointment line: "Vorlesung · Di 10:00–11:30 · 📍 Raum".
 * @details Entries that were not converted yet show their old text and a hint instead of a time.
 * @param props.appointment Appointment with its kind.
 * @returns A term/description pair of the info card.
 */
function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const { kind, slot } = appointment;
  return (
    <div className={`${ROW} flex-wrap items-baseline gap-x-1.5`}>
      <dt className="font-semibold">{SLOT_KIND_LABELS[kind]}</dt>
      <dd className="contents text-label-2">
        <span aria-hidden="true">·</span>
        {isCompleteSlot(slot) ? (
          <span className="tabular-nums">{formatSlotTime(slot)}</span>
        ) : (
          <span>
            {slot.time ? `„${slot.time}“ – ` : ''}
            <span className="text-danger-ink">bitte Tag und Uhrzeit eintragen</span>
          </span>
        )}
        {slot.room && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex min-w-0 items-center gap-1 self-center break-words">
              <MapPinIcon className="size-4 shrink-0" />
              <span className="sr-only">Raum</span>
              {slot.room}
            </span>
          </>
        )}
      </dd>
    </div>
  );
}

/**
 * @brief Module facts as an iOS-style card: professor, ECTS and all appointments sorted by
 *        weekday and start. Empty fields are hidden.
 * @param props.module Module to describe.
 * @returns Large title plus info card.
 */
export function ModuleInfo({ module }: { module: ModuleRow }) {
  const facts = [
    ...(module.professor ? [{ term: 'Prof', value: module.professor }] : []),
    ...(module.ects !== null ? [{ term: 'ECTS', value: formatEcts(module.ects) }] : []),
  ];
  const appointments = moduleAppointments(module);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight break-words hyphens-auto lg:text-[34px]">
        {module.name}
      </h1>
      {facts.length + appointments.length > 0 && (
        <dl className="divide-y-[0.5px] divide-separator card">
          {facts.map((row) => (
            <div key={row.term} className={`${ROW} items-baseline justify-between gap-4`}>
              <dt className="shrink-0 text-label">{row.term}</dt>
              <dd className="min-w-0 text-right break-words text-label-2">{row.value}</dd>
            </div>
          ))}
          {appointments.map((appointment, index) => (
            <AppointmentRow key={index} appointment={appointment} />
          ))}
        </dl>
      )}
    </div>
  );
}
