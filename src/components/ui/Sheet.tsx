import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useVisualViewport } from '@/hooks/useVisualViewport';
import { cn } from '@/lib/cn';
import { leaveDuration } from '@/lib/motion';

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
  /** "danger" shows the submit action in red (destructive confirmation). */
  submitVariant?: 'primary' | 'danger';
  /** Disables the submit button and Enter-to-submit. */
  submitDisabled?: boolean;
}

/**
 * @brief Sets the initial focus once the dialog is open (React's autoFocus runs too early, while
 *        the dialog is still closed). Mark the field with `data-autofocus`; otherwise the panel
 *        itself is focused so no button shows a focus ring.
 * @param panel Sheet panel element.
 */
function focusInitial(panel: HTMLElement | null) {
  const target = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel;
  target?.focus({ preventScroll: true });
}

/** @brief Elements in which Enter must keep its native meaning. */
const ENTER_PASSTHROUGH = new Set(['TEXTAREA', 'BUTTON', 'A']);

/**
 * @brief Pop-up container: bottom sheet on narrow screens, centred modal from 1024 px, with an
 *        iOS navigation bar ("Abbrechen" | title | "Speichern") that stays visible above the keyboard.
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
  const panelRef = useRef<HTMLDivElement>(null);
  const viewport = useVisualViewport(mounted);

  // Mount synchronously when opening; unmounting happens after the leave transition.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        focusInitial(panelRef.current);
      }
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

  // Scroll lock that also works on iOS (overflow: hidden on <html> is ignored there).
  useEffect(() => {
    if (!mounted) return;
    const { style } = document.body;
    const scrollY = window.scrollY;
    const previous = { position: style.position, top: style.top, width: style.width };
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    return () => {
      Object.assign(style, previous);
      window.scrollTo(0, scrollY);
    };
  }, [mounted]);

  // Keep the focused field visible when the keyboard changes the visible height.
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && panelRef.current?.contains(active)) {
      active.scrollIntoView?.({ block: 'nearest' });
    }
  }, [viewport.height]);

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

  const header = (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-1.5 pb-1 lg:pt-2">
      <button
        type="button"
        onClick={onClose}
        className="min-h-11 justify-self-start rounded-lg px-2 text-[17px] text-link hover:bg-fill"
      >
        {onSubmit ? 'Abbrechen' : 'Schließen'}
      </button>
      <h2 id={titleId} className="truncate text-center text-[17px] font-semibold">
        {title}
      </h2>
      {onSubmit ? (
        <button
          type="submit"
          disabled={submitDisabled}
          className={cn(
            'min-h-11 justify-self-end rounded-lg px-2 text-[17px] font-semibold hover:bg-fill disabled:cursor-not-allowed disabled:text-label-3 disabled:hover:bg-transparent',
            submitVariant === 'danger' ? 'text-danger-ink' : 'text-link',
          )}
        >
          {submitLabel}
        </button>
      ) : (
        <span />
      )}
    </div>
  );

  const body = (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      {children}
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
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-label backdrop:bg-transparent"
    >
      <div
        data-visible={visible}
        onClick={onClose}
        className="absolute inset-0 bg-overlay opacity-0 transition-opacity duration-200 data-[visible=true]:opacity-100 motion-reduce:transition-none"
      />
      {/* Follows the visual viewport so the sheet always sits right above the iOS keyboard. */}
      <div
        style={{ height: viewport.height, transform: `translateY(${viewport.offsetTop}px)` }}
        className="pointer-events-none absolute inset-x-0 top-0 flex items-end justify-center lg:items-center lg:p-6"
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          style={{
            maxHeight: `min(90dvh, calc(${viewport.height}px - env(safe-area-inset-top) - 0.75rem))`,
          }}
          data-visible={visible}
          className="pointer-events-auto flex w-full max-w-[640px] translate-y-full flex-col rounded-t-[14px] bg-surface shadow-2xl transition duration-200 ease-out outline-none data-[visible=true]:translate-y-0 motion-reduce:transition-none lg:max-w-md lg:translate-y-2 lg:rounded-[14px] lg:opacity-0 lg:data-[visible=true]:translate-y-0 lg:data-[visible=true]:opacity-100"
        >
          <div
            className="mx-auto mt-1.5 h-[5px] w-9 shrink-0 rounded-full bg-fill-strong lg:hidden"
            aria-hidden="true"
          />
          {onSubmit ? (
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              {header}
              {body}
            </form>
          ) : (
            <>
              {header}
              {body}
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
