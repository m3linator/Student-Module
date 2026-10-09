/**
 * @file swipe-context.ts
 * @brief Context ensuring that only one swipe row is open at a time.
 */
import { createContext } from 'react';

/** @brief Shared open-row state of a SwipeGroup. */
export interface SwipeContextValue {
  /** Id of the currently opened row, or null. */
  openId: string | null;
  /** Opens a row (closing any other) or closes all with null. */
  setOpenId: (id: string | null) => void;
}

/** @brief Swipe group context; null outside of a SwipeGroup. */
export const SwipeContext = createContext<SwipeContextValue | null>(null);
