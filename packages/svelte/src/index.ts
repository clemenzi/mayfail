import { onDestroy } from "svelte";
import { derived, get, writable, type Readable } from "svelte/store";
import { mayfail, type Result } from "mayfail";

export type MayfailRunner<Arguments extends unknown[], Value> = (
  ...arguments_: Arguments
) => Value | Promise<Value>;

export type MayfailOperation<Arguments extends unknown[], Value> =
  | MayfailRunner<Arguments, Value>
  | Readable<MayfailRunner<Arguments, Value>>;

export interface UseMayfailState<Value> {
  error: Readable<Error | null>;
  isPending: Readable<boolean>;
  result: Readable<Result<Value> | null>;
  value: Readable<Value | null>;
}

export interface UseMayfailReturn<
  Arguments extends unknown[],
  Value,
> extends UseMayfailState<Value> {
  execute: (...arguments_: Arguments) => Promise<Result<Value>>;
  reset: () => void;
}

type InternalState<Value> = [result: Result<Value> | null, isPending: boolean];

const INITIAL_STATE: InternalState<never> = [null, false];

/**
 * Runs an operation and keeps its latest Result in Svelte stores.
 *
 * The operation is always awaited, so execute consistently returns a Promise.
 * When executions overlap, only the latest execution can update the stores.
 */
export function useMayfail<Arguments extends unknown[], Value>(
  operation: MayfailOperation<Arguments, Value>,
): UseMayfailReturn<Arguments, Awaited<Value>> {
  type ResolvedValue = Awaited<Value>;

  const state = writable<InternalState<ResolvedValue>>(INITIAL_STATE);
  let executionId = 0;

  const result = derived(state, ([$result]) => $result);
  const isPending = derived(state, ([, pending]) => pending);
  const error = derived(state, ([$result]) => ($result === null ? null : $result[1]));
  const value = derived(state, ([$result]) => ($result === null ? null : $result[0]));

  const execute = async (...arguments_: Arguments): Promise<Result<ResolvedValue>> => {
    const currentExecutionId = ++executionId;

    state.update(([$result, pending]) => (pending ? [$result, pending] : [$result, true]));

    const currentOperation = typeof operation === "function" ? operation : get(operation);
    const nextResult = await mayfail<Promise<ResolvedValue>>(
      async (): Promise<ResolvedValue> => (await currentOperation(...arguments_)) as ResolvedValue,
    );

    if (currentExecutionId === executionId) {
      state.set([nextResult, false]);
    }

    return nextResult;
  };

  const reset = (): void => {
    executionId += 1;
    state.set(INITIAL_STATE);
  };

  onDestroy(() => {
    executionId += 1;
    state.update(([$result]) => [$result, false]);
  });

  return {
    error,
    execute,
    isPending,
    reset,
    result,
    value,
  };
}
