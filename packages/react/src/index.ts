"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mayfail, type Result } from "mayfail";

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

type InternalState<Value> = [result: Result<Value> | null, isPending: boolean];

const INITIAL_STATE: InternalState<never> = [null, false];

/**
 * Runs an operation and keeps its latest Result in React state.
 *
 * The operation is always awaited, so execute consistently returns a Promise.
 * When executions overlap, only the latest execution can update the state.
 */
export function useMayfail<Arguments extends unknown[], Value>(
  operation: MayfailRunner<Arguments, Value>,
): UseMayfailReturn<Arguments, Awaited<Value>> {
  type ResolvedValue = Awaited<Value>;
  const [state, setState] = useState<InternalState<ResolvedValue>>(INITIAL_STATE);
  const operationRef = useRef(operation);
  const executionIdRef = useRef(0);

  operationRef.current = operation;

  useEffect(() => {
    return () => {
      executionIdRef.current += 1;
    };
  }, []);

  const execute = useCallback(async (...arguments_: Arguments): Promise<Result<ResolvedValue>> => {
    const executionId = ++executionIdRef.current;

    setState((currentState) => (currentState[1] ? currentState : [currentState[0], true]));

    const nextResult = await mayfail<Promise<ResolvedValue>>(
      async (): Promise<ResolvedValue> =>
        (await operationRef.current(...arguments_)) as ResolvedValue,
    );

    if (executionId === executionIdRef.current) {
      setState([nextResult, false]);
    }

    return nextResult;
  }, []);

  const reset = useCallback(() => {
    executionIdRef.current += 1;
    setState(INITIAL_STATE);
  }, []);

  return useMemo(() => {
    const [result, isPending] = state;

    return {
      error: result === null ? null : result[1],
      execute,
      isPending,
      reset,
      result,
      value: result === null ? null : result[0],
    };
  }, [execute, reset, state]);
}
