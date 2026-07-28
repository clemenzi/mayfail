import { useCallback, useState } from "react";
import { mayfail } from "mayfail";
import type { Result } from "mayfail";

export type MayfailRunner<Arguments extends unknown[], Value> = (
  ...arguments_: Arguments
) => Value | Promise<Value>;

export interface UseMayfailState<Value> {
  error: Error | null;
  isPending: boolean;
  result: Result<Value> | null;
  value: Value | null;
}

export interface UseMayfailReturn<
  Arguments extends unknown[],
  Value,
> extends UseMayfailState<Value> {
  execute: (...arguments_: Arguments) => Promise<Result<Value>>;
  reset: () => void;
}

/**
 * Runs an operation and keeps its latest Result in React state.
 *
 * The operation is always awaited, so execute consistently returns a Promise.
 */
export function useMayfail<Arguments extends unknown[], Value>(
  operation: MayfailRunner<Arguments, Value>,
): UseMayfailReturn<Arguments, Awaited<Value>> {
  type ResolvedValue = Awaited<Value>;
  const [result, setResult] = useState<Result<ResolvedValue> | null>(null);
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (...arguments_: Arguments): Promise<Result<ResolvedValue>> => {
      setIsPending(true);
      const nextResult = await mayfail<Promise<ResolvedValue>>(() =>
        Promise.resolve(operation(...arguments_)),
      );
      setResult(nextResult);
      setIsPending(false);
      return nextResult;
    },
    [operation],
  );

  const reset = useCallback(() => {
    setResult(null);
    setIsPending(false);
  }, []);

  return {
    error: result?.[1] ?? null,
    execute,
    isPending,
    reset,
    result,
    value: result?.[0] ?? null,
  };
}
