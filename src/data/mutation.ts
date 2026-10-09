/**
 * @file mutation.ts
 * @brief Optimistic mutation runner: apply locally, send to Supabase, roll back on failure.
 */
import { toGermanMessage } from '@/lib/errors';
import type { DataAction, DataStore } from './store';

/** @brief Result shape shared by all Supabase/PostgREST calls. */
export interface RequestResult {
  error: unknown;
}

/** @brief One optimistic change. */
export interface Mutation {
  /** Local change applied immediately. */
  apply: DataAction;
  /** Local change that undoes `apply` if the request fails. */
  rollback: DataAction;
  /** Server request performing the change. */
  request: () => PromiseLike<RequestResult>;
  /** German fallback message if the error is not recognised. */
  errorMessage: string;
}

/**
 * @brief Runs a mutation optimistically.
 * @param store Data store.
 * @param onError Receives a German error message after a rollback.
 * @param mutation Change description.
 * @returns True on success, false after a rollback.
 */
export async function runMutation(
  store: DataStore,
  onError: (message: string) => void,
  mutation: Mutation,
): Promise<boolean> {
  store.dispatch(mutation.apply);
  let error: unknown;
  try {
    ({ error } = await mutation.request());
  } catch (thrown) {
    error = thrown ?? new Error('Unknown error');
  }
  if (!error) return true;
  store.dispatch(mutation.rollback);
  onError(toGermanMessage(error, mutation.errorMessage));
  return false;
}

/**
 * @brief Runs several requests in parallel and reports the first error.
 * @param requests Requests to run.
 * @returns Combined result.
 */
export async function allRequests(requests: PromiseLike<RequestResult>[]): Promise<RequestResult> {
  const results = await Promise.all(requests);
  return { error: results.find((result) => result.error)?.error ?? null };
}
