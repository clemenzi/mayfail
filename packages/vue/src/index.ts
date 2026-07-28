import { computed, onScopeDispose, shallowRef, unref, type ComputedRef, type Ref } from "vue";
import { mayfail, type Result } from "mayfail";

export type MayfailRunner<Arguments extends unknown[], Value> = (
  ...arguments_: Arguments
) => Value | Promise<Value>;

export type MayfailOperation<Arguments extends unknown[], Value> =
  | MayfailRunner<Arguments, Value>
  | Ref<MayfailRunner<Arguments, Value>>;

export interface UseMayfailState<Value> {
  error: ComputedRef<Error | null>;
  isPending: ComputedRef<boolean>;
  result: ComputedRef<Result<Value> | null>;
  value: ComputedRef<Value | null>;
}

export interface UseMayfailReturn<
  Arguments extends unknown[],
  Value,
> extends UseMayfailState<Value> {
  execute: (...arguments_: Arguments) => Promise<Result<Value>>;
  reset: () => void;
}

/**
 * Runs an operation and keeps its latest Result in Vue state.
 *
 * The operation is always awaited, so execute consistently returns a Promise.
 * When executions overlap, only the latest execution can update the state.
 */
export function useMayfail<Arguments extends unknown[], Value>(
  operation: MayfailOperation<Arguments, Value>,
): UseMayfailReturn<Arguments, Awaited<Value>> {
  type ResolvedValue = Awaited<Value>;

  const currentResult = shallowRef<Result<ResolvedValue> | null>(null);
  const pending = shallowRef(false);
  let executionId = 0;

  const result = computed<Result<ResolvedValue> | null>(() => currentResult.value);
  const isPending = computed<boolean>(() => pending.value);
  const error = computed<Error | null>(() =>
    currentResult.value === null ? null : currentResult.value[1],
  );
  const value = computed<ResolvedValue | null>(() =>
    currentResult.value === null ? null : currentResult.value[0],
  );

  const execute = async (...arguments_: Arguments): Promise<Result<ResolvedValue>> => {
    const currentExecutionId = ++executionId;
    pending.value = true;

    const nextResult = await mayfail<Promise<ResolvedValue>>(
      async (): Promise<ResolvedValue> => (await unref(operation)(...arguments_)) as ResolvedValue,
    );

    if (currentExecutionId === executionId) {
      currentResult.value = nextResult;
      pending.value = false;
    }

    return nextResult;
  };

  const reset = (): void => {
    executionId += 1;
    currentResult.value = null;
    pending.value = false;
  };

  onScopeDispose(() => {
    executionId += 1;
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
