import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '@/context/toast-context';

/**
 * @brief Accesses the toast API.
 * @returns show/showError/dismiss functions.
 * @throws Error when used outside of a ToastProvider.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
