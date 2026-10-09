/**
 * @file toast-context.ts
 * @brief React context object for toast notifications (kept separate for fast refresh).
 */
import { createContext } from 'react';

/** @brief Optional inline action of a toast (e.g. "Rückgängig"). */
export interface ToastAction {
  label: string;
  onAction: () => void;
}

/** @brief Options for showing a toast. */
export interface ToastOptions {
  /** Inline action button; the toast closes after it is pressed. */
  action?: ToastAction;
  /** Display duration in ms (defaults to TOAST_MS). */
  duration?: number;
  /** "error" toasts are announced assertively to screen readers. */
  tone?: 'neutral' | 'error';
}

/** @brief API exposed by the ToastProvider. */
export interface ToastContextValue {
  /**
   * @brief Shows a toast.
   * @returns Id that can be passed to dismiss().
   */
  show: (message: string, options?: ToastOptions) => number;
  /** @brief Shows an error toast with a German message. */
  showError: (message: string) => number;
  /** @brief Removes a toast immediately. */
  dismiss: (id: number) => void;
}

/** @brief Toast context; null outside of a ToastProvider. */
export const ToastContext = createContext<ToastContextValue | null>(null);
