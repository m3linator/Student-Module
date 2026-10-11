/**
 * @file database.ts
 * @brief Typed description of the Supabase schema (mirrors `supabase/migrations`).
 *
 * The shape follows the output of `supabase gen types typescript`, so it can be regenerated with
 * the Supabase CLI later. Row types are `type` aliases (not interfaces) because supabase-js
 * requires them to be assignable to `Record<string, unknown>`.
 */

/** @brief ISO weekday: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * @brief One lecture or exercise appointment (stored as JSON in `modules`).
 * @details Weekday, start and end are either all set or – for entries from version 0.2.0 that
 * could not be converted – all null. The database enforces this (see `time_slots_valid`).
 */
export type TimeSlot = {
  /** Room, may be empty. */
  room: string;
  weekday: Weekday | null;
  /** Start as `HH:MM`. */
  start_time: string | null;
  /** End as `HH:MM`, later than the start. */
  end_time: string | null;
  /** Free-text time of version 0.2.0; only present until the cleanup migration ran. */
  time?: string;
};

/** @brief Row type of `public.modules`. */
export type ModuleRow = {
  id: string;
  user_id: string;
  name: string;
  professor: string | null;
  ects: number | null;
  /** Lectures of the module (jsonb array). */
  lectures: TimeSlot[];
  /** Exercises / tutorials of the module (jsonb array). */
  exercises: TimeSlot[];
  notes: string;
  created_at: string;
  updated_at: string;
};

/** @brief Row type of `public.module_links`. */
export type ModuleLinkRow = {
  id: string;
  user_id: string;
  module_id: string;
  title: string;
  url: string;
  position: number;
  created_at: string;
};

/** @brief Row type of `public.tasks`. */
export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  /** Due date as ISO date (`YYYY-MM-DD`) or null. */
  due_date: string | null;
  finish_day_before: boolean;
  module_id: string | null;
  /** Completion timestamp; null means the task is still open. */
  completed_at: string | null;
  created_at: string;
};

/** @brief Row type of `public.habits`. */
export type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

/** @brief Row type of `public.habit_checks`. */
export type HabitCheckRow = {
  habit_id: string;
  user_id: string;
  /** Checked day as ISO date (`YYYY-MM-DD`). */
  date: string;
};

/**
 * @brief Makes the given keys of a type optional.
 * @tparam T Source type.
 * @tparam K Keys that become optional (columns with a default or nullable columns).
 */
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * @brief Declares one table for the typed Supabase client.
 * @tparam R Row type.
 * @tparam K Columns that may be omitted on insert.
 */
type TableDef<R, K extends keyof R> = {
  Row: R;
  Insert: Optional<R, K>;
  Update: Partial<R>;
  Relationships: [];
};

/** @brief Full database type passed to `createClient<Database>()`. */
export type Database = {
  public: {
    Tables: {
      modules: TableDef<
        ModuleRow,
        | 'id'
        | 'user_id'
        | 'professor'
        | 'ects'
        | 'lectures'
        | 'exercises'
        | 'notes'
        | 'created_at'
        | 'updated_at'
      >;
      module_links: TableDef<ModuleLinkRow, 'id' | 'user_id' | 'position' | 'created_at'>;
      tasks: TableDef<
        TaskRow,
        | 'id'
        | 'user_id'
        | 'due_date'
        | 'finish_day_before'
        | 'module_id'
        | 'completed_at'
        | 'created_at'
      >;
      habits: TableDef<HabitRow, 'id' | 'user_id' | 'name' | 'created_at'>;
      habit_checks: TableDef<HabitCheckRow, 'user_id'>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

/** @brief Union of all table names in the public schema. */
export type TableName = keyof Database['public']['Tables'];

/**
 * @brief Insert type lookup by table name.
 * @tparam T Table name.
 */
export type InsertOf<T extends TableName> = Database['public']['Tables'][T]['Insert'];
