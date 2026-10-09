/**
 * @file reorder.ts
 * @brief Pure helpers for drag & drop reordering.
 */

/**
 * @brief Moves one element of a list to another index.
 * @param items Source list (not mutated).
 * @param from Current index.
 * @param to Target index (clamped to the list bounds).
 * @returns New list.
 */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const result = [...items];
  const [item] = result.splice(from, 1);
  if (item === undefined) return result;
  result.splice(Math.max(0, Math.min(to, result.length)), 0, item);
  return result;
}

/**
 * @brief Computes the drop index of a dragged item from the pointer position.
 * @param midpoints Vertical midpoints of all items at drag start (in list order).
 * @param draggedIndex Index of the dragged item at drag start.
 * @param pointerY Current pointer position (same coordinate space as the midpoints).
 * @returns Target index = number of other items whose midpoint lies above the pointer.
 */
export function insertIndex(
  midpoints: readonly number[],
  draggedIndex: number,
  pointerY: number,
): number {
  return midpoints.filter((mid, index) => index !== draggedIndex && mid < pointerY).length;
}
