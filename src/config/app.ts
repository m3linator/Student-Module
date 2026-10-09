/**
 * @file app.ts
 * @brief Central app-wide constants (name, time zone, breakpoints, timings).
 *
 * Change the app name, layout breakpoints or timings here – everything else reads from this file.
 */

/** @brief Display name of the app (header, manifest, page title). */
export const APP_NAME = 'Uni-App';

/** @brief IANA time zone used for every date calculation. */
export const TIME_ZONE = 'Europe/Berlin';

/** @brief Minimum viewport width (px) for the two-column desktop layout. */
export const DESKTOP_MIN_WIDTH = 1024;

/** @brief Debounce delay (ms) before notes are auto-saved. */
export const NOTES_SAVE_DEBOUNCE_MS = 800;

/** @brief How long (ms) the "undo delete" toast stays visible. */
export const UNDO_TOAST_MS = 5000;

/** @brief Default display duration (ms) for regular toasts. */
export const TOAST_MS = 4000;
