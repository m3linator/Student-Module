/**
 * @file actions.ts
 * @brief All data changes of the app as optimistic mutations against Supabase.
 */
import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import type { IsoDate } from '@/lib/berlinDate';
import type { HabitCheckRow, ModuleLinkRow, ModuleRow, TaskRow } from '@/types/database';
import { allRequests, runMutation, type Mutation } from './mutation';
import { selectLinks } from './selectors';
import type { DataAction, DataStore, TableRows } from './store';

/** @brief Editable fields of a task. */
export type TaskInput = Pick<TaskRow, 'title' | 'due_date' | 'finish_day_before' | 'module_id'>;

/** @brief Editable fields of a module (notes are edited separately). */
export type ModuleInput = Omit<ModuleRow, 'id' | 'user_id' | 'notes' | 'created_at' | 'updated_at'>;

/** @brief Editable fields of a link. */
export type LinkInput = Pick<ModuleLinkRow, 'title' | 'url'>;

/** @brief Dependencies of the action factory. */
export interface ActionDeps {
  store: DataStore;
  userId: string;
  /** Shows a German error message (toast). */
  onError: (message: string) => void;
}

/**
 * @brief Loads every table of the signed-in user and creates the default habit if missing.
 * @returns Rows of all tables.
 * @throws The first Supabase error encountered.
 */
export async function loadAllRows(): Promise<TableRows> {
  const [modules, links, tasks, habits, checks] = await Promise.all([
    supabase.from('modules').select('*'),
    supabase.from('module_links').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('habits').select('*'),
    supabase.from('habit_checks').select('*'),
  ]);
  const error = modules.error ?? links.error ?? tasks.error ?? habits.error ?? checks.error;
  if (error) throw error;

  let habitRows = habits.data ?? [];
  if (habitRows.length === 0) {
    // First login: create the single default habit ("Fokus"). The unique (user_id) constraint
    // makes this safe when two devices start at the same time.
    const created = await supabase
      .from('habits')
      .upsert({ name: 'Fokus' }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (created.error) throw created.error;
    const reloaded = await supabase.from('habits').select('*');
    if (reloaded.error) throw reloaded.error;
    habitRows = reloaded.data;
  }

  return {
    modules: modules.data ?? [],
    module_links: links.data ?? [],
    tasks: tasks.data ?? [],
    habits: habitRows,
    habit_checks: checks.data ?? [],
  };
}

/**
 * @brief Creates the action API bound to one store and user.
 * @param deps Store, user id and error reporter.
 * @returns Object with all domain actions.
 */
export function createActions({ store, userId, onError }: ActionDeps) {
  const tables = () => store.getState().tables;
  const now = () => new Date().toISOString();
  const run = (mutation: Mutation) => runMutation(store, onError, mutation);
  const unchanged = () => Promise.resolve(false);

  /**
   * @brief Changes fields of a task.
   * @param id Task id.
   * @param patch Fields to change.
   * @returns True on success.
   */
  function updateTask(
    id: string,
    patch: Partial<TaskInput> & Pick<Partial<TaskRow>, 'completed_at'>,
  ) {
    const previous = tables().tasks[id];
    if (!previous) return unchanged();
    return run({
      apply: { type: 'upsert', table: 'tasks', row: { ...previous, ...patch } },
      rollback: { type: 'upsert', table: 'tasks', row: previous },
      request: () => supabase.from('tasks').update(patch).eq('id', id),
      errorMessage: 'Die Aufgabe konnte nicht gespeichert werden.',
    });
  }

  return {
    /**
     * @brief Creates a task.
     * @param input Task fields.
     * @returns True on success.
     */
    addTask(input: TaskInput) {
      const row: TaskRow = {
        id: createId(),
        user_id: userId,
        completed_at: null,
        created_at: now(),
        ...input,
      };
      return run({
        apply: { type: 'upsert', table: 'tasks', row },
        rollback: { type: 'remove', table: 'tasks', key: row.id },
        request: () => supabase.from('tasks').insert(row),
        errorMessage: 'Die Aufgabe konnte nicht gespeichert werden.',
      });
    },

    updateTask,

    /**
     * @brief Marks a task as done or open again.
     * @param id Task id.
     * @param completed True to complete, false to restore.
     * @returns True on success.
     */
    setTaskCompleted(id: string, completed: boolean) {
      return updateTask(id, { completed_at: completed ? now() : null });
    },

    /**
     * @brief Deletes a task permanently.
     * @param id Task id.
     * @returns True on success.
     */
    deleteTask(id: string) {
      const previous = tables().tasks[id];
      if (!previous) return unchanged();
      return run({
        apply: { type: 'remove', table: 'tasks', key: id },
        rollback: { type: 'upsert', table: 'tasks', row: previous },
        request: () => supabase.from('tasks').delete().eq('id', id),
        errorMessage: 'Die Aufgabe konnte nicht gelöscht werden.',
      });
    },

    /**
     * @brief Re-inserts a deleted task with its original id and timestamps (undo).
     * @param row The deleted row.
     * @returns True on success.
     */
    restoreDeletedTask(row: TaskRow) {
      const moduleExists = row.module_id === null || row.module_id in tables().modules;
      const restored = moduleExists ? row : { ...row, module_id: null };
      return run({
        apply: { type: 'upsert', table: 'tasks', row: restored },
        rollback: { type: 'remove', table: 'tasks', key: row.id },
        request: () => supabase.from('tasks').insert(restored),
        errorMessage: 'Die Aufgabe konnte nicht wiederhergestellt werden.',
      });
    },

    /**
     * @brief Creates a module.
     * @param input Module fields.
     * @returns The new module id, or null on failure.
     */
    async addModule(input: ModuleInput) {
      const timestamp = now();
      const row: ModuleRow = {
        id: createId(),
        user_id: userId,
        notes: '',
        created_at: timestamp,
        updated_at: timestamp,
        ...input,
      };
      const ok = await run({
        apply: { type: 'upsert', table: 'modules', row },
        rollback: { type: 'remove', table: 'modules', key: row.id },
        request: () => supabase.from('modules').insert(row),
        errorMessage: 'Das Modul konnte nicht gespeichert werden.',
      });
      return ok ? row.id : null;
    },

    /**
     * @brief Changes fields of a module.
     * @param id Module id.
     * @param patch Fields to change.
     * @returns True on success.
     */
    updateModule(id: string, patch: Partial<ModuleInput>) {
      const previous = tables().modules[id];
      if (!previous) return unchanged();
      return run({
        apply: { type: 'upsert', table: 'modules', row: { ...previous, ...patch } },
        rollback: { type: 'upsert', table: 'modules', row: previous },
        request: () => supabase.from('modules').update(patch).eq('id', id),
        errorMessage: 'Das Modul konnte nicht gespeichert werden.',
      });
    },

    /**
     * @brief Saves the Markdown notes of a module.
     * @param id Module id.
     * @param notes Full notes text.
     * @returns True on success.
     */
    saveNotes(id: string, notes: string) {
      const previous = tables().modules[id];
      if (!previous) return unchanged();
      return run({
        apply: { type: 'upsert', table: 'modules', row: { ...previous, notes } },
        rollback: { type: 'upsert', table: 'modules', row: previous },
        request: () => supabase.from('modules').update({ notes }).eq('id', id),
        errorMessage: 'Die Notizen konnten nicht gespeichert werden.',
      });
    },

    /**
     * @brief Deletes a module with its links and notes; its tasks stay without module.
     * @param id Module id.
     * @returns True on success.
     */
    deleteModule(id: string) {
      const current = tables();
      const previous = current.modules[id];
      if (!previous) return unchanged();
      const links = selectLinks(current, id);
      const tasks = Object.values(current.tasks).filter((task) => task.module_id === id);
      const apply: DataAction = {
        type: 'batch',
        actions: [
          { type: 'remove', table: 'modules', key: id },
          ...links.map((link): DataAction => ({
            type: 'remove',
            table: 'module_links',
            key: link.id,
          })),
          ...tasks.map((task): DataAction => ({
            type: 'upsert',
            table: 'tasks',
            row: { ...task, module_id: null },
          })),
        ],
      };
      const rollback: DataAction = {
        type: 'batch',
        actions: [
          { type: 'upsert', table: 'modules', row: previous },
          ...links.map((row): DataAction => ({ type: 'upsert', table: 'module_links', row })),
          ...tasks.map((row): DataAction => ({ type: 'upsert', table: 'tasks', row })),
        ],
      };
      return run({
        apply,
        rollback,
        request: () => supabase.from('modules').delete().eq('id', id),
        errorMessage: 'Das Modul konnte nicht gelöscht werden.',
      });
    },

    /**
     * @brief Appends a link to a module.
     * @param moduleId Module id.
     * @param input Link name and (normalised) URL.
     * @returns True on success.
     */
    addLink(moduleId: string, input: LinkInput) {
      const existing = selectLinks(tables(), moduleId);
      const row: ModuleLinkRow = {
        id: createId(),
        user_id: userId,
        module_id: moduleId,
        position: existing.reduce((max, link) => Math.max(max, link.position + 1), 0),
        created_at: now(),
        ...input,
      };
      return run({
        apply: { type: 'upsert', table: 'module_links', row },
        rollback: { type: 'remove', table: 'module_links', key: row.id },
        request: () => supabase.from('module_links').insert(row),
        errorMessage: 'Der Link konnte nicht gespeichert werden.',
      });
    },

    /**
     * @brief Changes name or URL of a link.
     * @param id Link id.
     * @param patch Fields to change.
     * @returns True on success.
     */
    updateLink(id: string, patch: Partial<LinkInput>) {
      const previous = tables().module_links[id];
      if (!previous) return unchanged();
      return run({
        apply: { type: 'upsert', table: 'module_links', row: { ...previous, ...patch } },
        rollback: { type: 'upsert', table: 'module_links', row: previous },
        request: () => supabase.from('module_links').update(patch).eq('id', id),
        errorMessage: 'Der Link konnte nicht gespeichert werden.',
      });
    },

    /**
     * @brief Deletes a link.
     * @param id Link id.
     * @returns True on success.
     */
    deleteLink(id: string) {
      const previous = tables().module_links[id];
      if (!previous) return unchanged();
      return run({
        apply: { type: 'remove', table: 'module_links', key: id },
        rollback: { type: 'upsert', table: 'module_links', row: previous },
        request: () => supabase.from('module_links').delete().eq('id', id),
        errorMessage: 'Der Link konnte nicht gelöscht werden.',
      });
    },

    /**
     * @brief Persists a new link order (drag & drop).
     * @param moduleId Module id.
     * @param orderedIds Link ids in their new order.
     * @returns True on success.
     */
    reorderLinks(moduleId: string, orderedIds: string[]) {
      const links = selectLinks(tables(), moduleId);
      const byId = new Map(links.map((link) => [link.id, link]));
      const changed = orderedIds.flatMap((id, position) => {
        const link = byId.get(id);
        return link && link.position !== position ? [{ ...link, position }] : [];
      });
      if (changed.length === 0) return unchanged();
      return run({
        apply: {
          type: 'batch',
          actions: changed.map((row): DataAction => ({
            type: 'upsert',
            table: 'module_links',
            row,
          })),
        },
        rollback: {
          type: 'batch',
          actions: links.map((row): DataAction => ({ type: 'upsert', table: 'module_links', row })),
        },
        request: () =>
          allRequests(
            changed.map((link) =>
              supabase.from('module_links').update({ position: link.position }).eq('id', link.id),
            ),
          ),
        errorMessage: 'Die Reihenfolge konnte nicht gespeichert werden.',
      });
    },

    /**
     * @brief Renames the habit.
     * @param id Habit id.
     * @param name New name.
     * @returns True on success.
     */
    renameHabit(id: string, name: string) {
      const previous = tables().habits[id];
      if (!previous) return unchanged();
      return run({
        apply: { type: 'upsert', table: 'habits', row: { ...previous, name } },
        rollback: { type: 'upsert', table: 'habits', row: previous },
        request: () => supabase.from('habits').update({ name }).eq('id', id),
        errorMessage: 'Der Name konnte nicht gespeichert werden.',
      });
    },

    /**
     * @brief Checks or unchecks a habit day.
     * @param habitId Habit id.
     * @param date Day to toggle (ISO date).
     * @returns True on success.
     */
    toggleHabitCheck(habitId: string, date: IsoDate) {
      const key = `${habitId}|${date}`;
      const existing = tables().habit_checks[key];
      if (existing) {
        return run({
          apply: { type: 'remove', table: 'habit_checks', key },
          rollback: { type: 'upsert', table: 'habit_checks', row: existing },
          request: () =>
            supabase.from('habit_checks').delete().eq('habit_id', habitId).eq('date', date),
          errorMessage: 'Der Tag konnte nicht gespeichert werden.',
        });
      }
      const row: HabitCheckRow = { habit_id: habitId, user_id: userId, date };
      return run({
        apply: { type: 'upsert', table: 'habit_checks', row },
        rollback: { type: 'remove', table: 'habit_checks', key },
        request: () => supabase.from('habit_checks').insert(row),
        errorMessage: 'Der Tag konnte nicht gespeichert werden.',
      });
    },
  };
}

/** @brief Type of the object returned by createActions. */
export type Actions = ReturnType<typeof createActions>;
