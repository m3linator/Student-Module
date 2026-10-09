import { useEffect, useRef } from 'react';

/**
 * @brief Checks whether keyboard input currently goes into a text field.
 * @param target Event target.
 * @returns True for inputs, textareas, selects and contenteditable elements.
 */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * @brief Registers a single-key keyboard shortcut (no modifiers), ignored while typing or while
 *        a pop-up is open.
 * @param key Key to listen for (case-insensitive), e.g. "n".
 * @param handler Called when the shortcut fires.
 */
export function useShortcut(key: string, handler: () => void): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (isEditable(event.target) || document.querySelector('dialog[open]')) return;
      event.preventDefault();
      handlerRef.current();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [key]);
}
