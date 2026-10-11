import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { TOAST_MS } from '@/config/app';
import { ToastContext, type ToastContextValue, type ToastOptions } from './toast-context';

/** @brief Maximum number of toasts visible at once. */
const MAX_TOASTS = 3;

/** @brief Internal representation of a visible toast. */
interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

/**
 * @brief Provides toast notifications at the bottom of the screen (above the home indicator).
 * @param props.children Subtree that may call useToast().
 * @returns Context provider plus the toast stack.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, ...options }].slice(-MAX_TOASTS));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), options.duration ?? TOAST_MS),
      );
      return id;
    },
    [dismiss],
  );

  const showError = useCallback(
    (message: string) => show(message, { tone: 'error', duration: TOAST_MS + 1000 }),
    [show],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ show, showError, dismiss }),
    [show, showError, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-2xl bg-[#1c1c1e] py-1.5 pr-1.5 pl-4 text-[15px] text-white shadow-xl dark:bg-[#2c2c2e]"
          >
            {toast.tone === 'error' && (
              <span className="size-2 shrink-0 rounded-full bg-[#ff453a]" aria-hidden="true" />
            )}
            <span className="min-h-11 flex-1 content-center">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onAction();
                  dismiss(toast.id);
                }}
                className="min-h-11 rounded-xl px-3 font-semibold text-[#409cff] hover:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
