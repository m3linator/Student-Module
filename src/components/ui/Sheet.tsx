import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { leaveDuration } from '@/lib/motion';
import { Button, type ButtonVariant } from './Button';

/** @brief Props of Sheet. */
export interface SheetProps {
  /** Whether the sheet is shown. */
  open: boolean;
  /** Called on Esc, backdrop tap or "Abbrechen". */
  onClose: () => void;
  /** Heading, also used as the accessible name. */
  title: string;
  children: ReactNode;
  /** When set, the content becomes a form with "Abbrechen" / submit buttons; Enter submits. */
  onSubmit?: () => void;
  /** Label of the submit button (default "Speichern"). */
  submitLabel?: string;
  /** Visual variant of the submit button (default primary). */
  submitVariant?: ButtonVariant;
  /** Disables the submit button and Enter-to-submit. */
  submitDisabled?: boolean;
}

/** @brief Elements in which Enter must keep its native meaning. */
const ENTER_PASSTHROUGH = new Set(['TEXTAREA', 'BUTTON', 'A']);

/**
 * @brief Pop-up container: bottom sheet on narrow screens, centred modal from 1024 px.
 * @details Built on the native `<dialog>` element, which provides focus trapping, an inert
 * background and focus restoration. Enter/leave transitions take ~200 ms and are skipped with
 * `prefers-reduced-motion`.
 * @param props See SheetProps.
 * @returns The dialog, or nothing while closed.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Speichern',
  submitVariant = 'primary',
  submitDisabled = false,
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  // Mount synchronously when opening; unmounting happens after the leave transition.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const frame = requestAnimationFrame(() => setVisible(false));
    const timer = setTimeout(() => {
      if (dialog.open) dialog.close();
      setMounted(false);
    }, leaveDuration());
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [mounted]);

  if (!mounted) return null;

  /**
   * @brief Prevents the native page reload and forwards to onSubmit.
   * @param event Form submit event.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submitDisabled) onSubmit?.();
  }

  /**
   * @brief Makes Enter submit from any control (e.g. select, switch), not only text inputs.
   * @param event Key event bubbling up from a form control.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    const target = event.target as HTMLElement;
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing ||
      ENTER_PASSTHROUGH.has(target.tagName) ||
      target.getAttribute('role') === 'switch'
    ) {
      return;
    }
    event.preventDefault();
    event.currentTarget.requestSubmit();
  }

  const body = <div className="overflow-y-auto px-5 pt-1 pb-4">{children}</div>;
  const footer = onSubmit && (
    <div className="flex gap-3 border-t border-gray-100 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] lg:justify-end lg:pb-4">
      <Button variant="secondary" onClick={onClose} className="flex-1 lg:flex-none">
        Abbrechen
      </Button>
      <Button
        type="submit"
        variant={submitVariant}
        disabled={submitDisabled}
        className="flex-1 lg:flex-none"
      >
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
    >
      <div
        data-visible={visible}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-200 data-[visible=true]:opacity-100 motion-reduce:transition-none"
      />
      <div className="pointer-events-none relative flex h-full items-end justify-center lg:items-center lg:p-6">
        <div
          data-visible={visible}
          className="pointer-events-auto flex max-h-[90dvh] w-full max-w-[640px] translate-y-full flex-col rounded-t-2xl bg-white transition duration-200 ease-out data-[visible=true]:translate-y-0 motion-reduce:transition-none lg:max-w-md lg:translate-y-2 lg:rounded-2xl lg:border lg:border-gray-200 lg:opacity-0 lg:shadow-lg lg:data-[visible=true]:translate-y-0 lg:data-[visible=true]:opacity-100"
        >
          <div
            className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-200 lg:hidden"
            aria-hidden="true"
          />
          <h2 id={titleId} className="px-5 pt-3 pb-3 text-lg font-semibold lg:pt-5">
            {title}
          </h2>
          {onSubmit ? (
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="flex min-h-0 flex-col"
              noValidate
            >
              {body}
              {footer}
            </form>
          ) : (
            <div className="flex min-h-0 flex-col pb-[env(safe-area-inset-bottom)]">{body}</div>
          )}
        </div>
      </div>
    </dialog>
  );
}
