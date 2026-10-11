import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ExternalIcon, GripIcon, PencilIcon, TrashIcon } from '@/components/ui/icons';
import { Section } from '@/components/ui/Section';
import { SwipeRow } from '@/components/ui/SwipeRow';
import type { LinkInput } from '@/data/actions';
import { useActions } from '@/hooks/useData';
import { insertIndex, moveItem } from '@/lib/reorder';
import { cn } from '@/lib/cn';
import type { ModuleLinkRow } from '@/types/database';
import { LinkSheet } from './LinkSheet';

/** @brief State of an active drag. */
interface DragState {
  id: string;
  pointerId: number;
  startIndex: number;
  midpoints: number[];
  order: string[];
}

/**
 * @brief "Wichtige Links" of a module: named links (URL hidden), swipe/hover to edit or delete,
 *        drag handle (or arrow keys) to reorder.
 * @param props.moduleId Owning module.
 * @param props.links Links in their stored order.
 * @returns The section.
 */
export function LinksSection({ moduleId, links }: { moduleId: string; links: ModuleLinkRow[] }) {
  const actions = useActions();
  const [sheet, setSheet] = useState<{ open: boolean; link: ModuleLinkRow | null; key: number }>({
    open: false,
    link: null,
    key: 0,
  });
  const [drag, setDrag] = useState<DragState | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const byId = new Map(links.map((link) => [link.id, link]));
  const ordered = drag ? drag.order.flatMap((id) => byId.get(id) ?? []) : links;

  /**
   * @brief Opens the link pop-up.
   * @param link Link to edit, or null for a new one.
   */
  const openSheet = (link: ModuleLinkRow | null) =>
    setSheet((s) => ({ open: true, link, key: s.key + 1 }));

  /**
   * @brief Saves the pop-up values.
   * @param input Name and normalised URL.
   */
  function handleSave(input: LinkInput) {
    if (sheet.link) void actions.updateLink(sheet.link.id, input);
    else void actions.addLink(moduleId, input);
    setSheet((s) => ({ ...s, open: false }));
  }

  /**
   * @brief Starts dragging a link by its handle.
   * @param event Pointer down on the handle.
   * @param id Link id.
   */
  function startDrag(event: PointerEvent<HTMLButtonElement>, id: string) {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-link-id]') ?? [];
    const midpoints = Array.from(items, (item) => {
      const rect = item.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      id,
      pointerId: event.pointerId,
      startIndex: links.findIndex((link) => link.id === id),
      midpoints,
      order: links.map((link) => link.id),
    });
  }

  /**
   * @brief Reorders the preview while the handle moves.
   * @param event Pointer move.
   */
  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const target = insertIndex(drag.midpoints, drag.startIndex, event.clientY);
    const from = drag.order.indexOf(drag.id);
    if (target !== from) setDrag({ ...drag, order: moveItem(drag.order, from, target) });
  }

  /** @brief Persists the new order when the handle is released. */
  function endDrag() {
    if (!drag) return;
    void actions.reorderLinks(moduleId, drag.order);
    setDrag(null);
  }

  /**
   * @brief Moves a link one step with the arrow keys (keyboard alternative to dragging).
   * @param event Key event on the handle.
   * @param index Current index of the link.
   */
  function handleHandleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!delta) return;
    event.preventDefault();
    const target = index + delta;
    if (target < 0 || target >= links.length) return;
    void actions.reorderLinks(
      moduleId,
      moveItem(
        links.map((link) => link.id),
        index,
        target,
      ),
    );
  }

  return (
    <Section title="Wichtige Links" onAdd={() => openSheet(null)} addLabel="Neuer Link">
      {links.length === 0 ? (
        <p className="card text-label-2 px-4 py-5 text-center">Noch keine Links – tippe auf +</p>
      ) : (
        <ul ref={listRef} className="card divide-separator divide-y-[0.5px] overflow-hidden">
          {ordered.map((link, index) => (
            <li
              key={link.id}
              data-link-id={link.id}
              className={cn(drag?.id === link.id && 'relative z-10 shadow-lg')}
            >
              <SwipeRow
                id={link.id}
                label={`${link.title} (öffnet im Browser)`}
                href={link.url}
                leading={
                  links.length > 1 && (
                    <button
                      type="button"
                      aria-label={`${link.title} verschieben (Pfeiltasten)`}
                      title="Ziehen zum Sortieren"
                      onPointerDown={(event) => startDrag(event, link.id)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onKeyDown={(event) => handleHandleKey(event, index)}
                      className="text-label-3 hover:text-label-2 flex w-9 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                    >
                      <GripIcon className="size-4" />
                    </button>
                  )
                }
                actions={[
                  {
                    label: 'Löschen',
                    icon: <TrashIcon />,
                    tone: 'red',
                    exit: true,
                    onClick: () => void actions.deleteLink(link.id),
                  },
                  {
                    label: 'Bearbeiten',
                    icon: <PencilIcon />,
                    tone: 'gray',
                    onClick: () => openSheet(link),
                  },
                ]}
              >
                <span
                  className={cn(
                    'text-link flex min-h-12 items-center gap-2 py-2 pr-4 text-base',
                    links.length > 1 ? 'pl-1' : 'pl-4',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{link.title}</span>
                  <ExternalIcon className="text-label-3 size-4 shrink-0" />
                </span>
              </SwipeRow>
            </li>
          ))}
        </ul>
      )}
      <LinkSheet
        key={sheet.key}
        open={sheet.open}
        link={sheet.link}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
        onSave={handleSave}
      />
    </Section>
  );
}
