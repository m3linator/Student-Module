/**
 * @file fieldStyles.ts
 * @brief Shared Tailwind classes of form controls (iOS filled style).
 */

/** @brief Label above a form control. */
export const FIELD_LABEL = 'text-[13px] font-medium text-label-2';

/** @brief Filled input / select / textarea (16 px so iOS does not zoom on focus). */
export const FIELD_CONTROL =
  'min-h-11 w-full rounded-xl bg-fill px-3.5 text-base text-label placeholder:text-label-2 focus:ring-2 focus:ring-link focus-visible:outline-none aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger';
