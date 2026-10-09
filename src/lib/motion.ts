/**
 * @file motion.ts
 * @brief Shared animation timing that respects `prefers-reduced-motion`.
 */

/** @brief Default duration (ms) of enter/leave transitions. */
export const ANIMATION_MS = 200;

/**
 * @brief Checks whether the user asked the OS to reduce motion.
 * @returns True when animations should be skipped.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * @brief Duration to wait for a leave transition before unmounting.
 * @returns 0 with reduced motion, otherwise ANIMATION_MS.
 */
export function leaveDuration(): number {
  return prefersReducedMotion() ? 0 : ANIMATION_MS;
}
