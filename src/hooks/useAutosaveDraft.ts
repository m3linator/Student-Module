import { useCallback, useEffect, useRef, useState } from 'react';

/** @brief Save indicator state. */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** @brief Return value of useAutosaveDraft. */
export interface AutosaveDraft {
  /** Text shown in the editor. */
  draft: string;
  status: SaveStatus;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

/**
 * @brief Local editing buffer with debounced autosave and protection against remote overwrites.
 * @details While the field is focused or has unsaved changes, new server values (e.g. Realtime
 * updates from another device) are ignored; they are adopted once the field is left and saved.
 * Pending text is flushed immediately on blur, when the app goes to the background and on unmount.
 * @param serverValue Value currently stored (store / Realtime).
 * @param save Persists a value; resolves to true on success.
 * @param delay Debounce delay in ms.
 * @returns Draft text, save status and editor event handlers.
 */
export function useAutosaveDraft(
  serverValue: string,
  save: (value: string) => Promise<boolean>,
  delay: number,
): AutosaveDraft {
  const [draft, setDraft] = useState(serverValue);
  const [saved, setSaved] = useState(serverValue);
  const [seenServer, setSeenServer] = useState(serverValue);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');

  // Adopt remote changes only while the user is not editing (state adjustment during render).
  if (serverValue !== seenServer && !focused && draft === saved) {
    setSeenServer(serverValue);
    setDraft(serverValue);
    setSaved(serverValue);
  }

  const latest = useRef({ draft, saved });
  const inFlight = useRef<string | null>(null);
  useEffect(() => {
    latest.current = { draft, saved };
  }, [draft, saved]);

  const flush = useCallback(async () => {
    const value = latest.current.draft;
    if (value === latest.current.saved || inFlight.current === value) return;
    inFlight.current = value;
    setStatus('saving');
    const ok = await save(value);
    if (inFlight.current === value) inFlight.current = null;
    if (!ok) {
      setStatus('error');
      return;
    }
    latest.current = { ...latest.current, saved: value };
    setSaved(value);
    setStatus(latest.current.draft === value ? 'saved' : 'saving');
  }, [save]);

  useEffect(() => {
    if (draft === saved) return;
    const timer = setTimeout(() => void flush(), delay);
    return () => clearTimeout(timer);
  }, [draft, saved, flush, delay]);

  useEffect(() => {
    const handleHide = () => {
      if (document.visibilityState === 'hidden') void flush();
    };
    const handlePageHide = () => void flush();
    document.addEventListener('visibilitychange', handleHide);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleHide);
      window.removeEventListener('pagehide', handlePageHide);
      void flush();
    };
  }, [flush]);

  const onChange = useCallback((value: string) => {
    latest.current = { ...latest.current, draft: value };
    setDraft(value);
    setStatus('saving');
  }, []);

  const onFocus = useCallback(() => setFocused(true), []);

  const onBlur = useCallback(() => {
    setFocused(false);
    void flush();
  }, [flush]);

  return { draft, status, onChange, onFocus, onBlur };
}
