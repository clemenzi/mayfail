// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { useMayfail } from "../src";

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

test("exposes the latest successful result", async () => {
  const { result } = renderHook(() => useMayfail(async (value: number) => value * 2));

  await act(async () => {
    await expect(result.current.execute(21)).resolves.toEqual([42, null]);
  });

  expect(result.current).toMatchObject({ error: null, isPending: false, value: 42 });
});

test("captures errors instead of throwing", async () => {
  const error = new Error("unavailable");
  const { result } = renderHook(() =>
    useMayfail(() => {
      throw error;
    }),
  );

  await act(async () => {
    await expect(result.current.execute()).resolves.toEqual([null, error]);
  });

  expect(result.current.error).toBe(error);
});

test("sets pending state while an execution is running", async () => {
  const pending = deferred<string>();
  const { result } = renderHook(() => useMayfail(() => pending.promise));

  let execution!: ReturnType<typeof result.current.execute>;
  act(() => {
    execution = result.current.execute();
  });

  expect(result.current).toMatchObject({
    error: null,
    isPending: true,
    result: null,
    value: null,
  });

  await act(async () => {
    pending.resolve("complete");
    await execution;
  });

  expect(result.current).toMatchObject({
    isPending: false,
    result: ["complete", null],
    value: "complete",
  });
});

test("only lets the latest overlapping execution update state", async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const operation = vi
    .fn<() => Promise<string>>()
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => useMayfail(operation));

  let firstExecution!: ReturnType<typeof result.current.execute>;
  let secondExecution!: ReturnType<typeof result.current.execute>;
  act(() => {
    firstExecution = result.current.execute();
    secondExecution = result.current.execute();
  });

  await act(async () => {
    first.resolve("stale");
    await firstExecution;
  });

  expect(result.current).toMatchObject({ isPending: true, result: null });

  await act(async () => {
    second.resolve("latest");
    await secondExecution;
  });

  expect(result.current).toMatchObject({
    isPending: false,
    result: ["latest", null],
    value: "latest",
  });
});

test("reset invalidates an execution that is still in flight", async () => {
  const pending = deferred<string>();
  const { result } = renderHook(() => useMayfail(() => pending.promise));

  let execution!: ReturnType<typeof result.current.execute>;
  act(() => {
    execution = result.current.execute();
  });
  act(() => {
    result.current.reset();
  });

  expect(result.current).toMatchObject({
    isPending: false,
    result: null,
    value: null,
  });

  await act(async () => {
    pending.resolve("ignored");
    await execution;
  });

  expect(result.current).toMatchObject({
    isPending: false,
    result: null,
    value: null,
  });
});

test("keeps actions stable and executes the latest operation", async () => {
  const firstOperation = vi.fn((value: number) => value);
  const secondOperation = vi.fn((value: number) => value * 2);
  const { rerender, result } = renderHook(({ operation }) => useMayfail(operation), {
    initialProps: { operation: firstOperation },
  });
  const firstExecute = result.current.execute;
  const firstReset = result.current.reset;
  const firstReturn = result.current;

  rerender({ operation: secondOperation });

  expect(result.current.execute).toBe(firstExecute);
  expect(result.current.reset).toBe(firstReset);
  expect(result.current).toBe(firstReturn);

  await act(async () => {
    await expect(result.current.execute(21)).resolves.toEqual([42, null]);
  });

  expect(firstOperation).not.toHaveBeenCalled();
  expect(secondOperation).toHaveBeenCalledOnce();
});

test("preserves an undefined success value in the result shape", async () => {
  const { result } = renderHook(() => useMayfail(() => undefined));

  await act(async () => {
    await result.current.execute();
  });

  expect(result.current.result).toEqual([undefined, null]);
  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeNull();
});

test("does not update state after unmount", async () => {
  const pending = deferred<string>();
  const { result, unmount } = renderHook(() => useMayfail(() => pending.promise));
  const execution = result.current.execute();

  unmount();
  pending.resolve("complete");

  await expect(execution).resolves.toEqual(["complete", null]);
});
