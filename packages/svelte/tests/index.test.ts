import { get, writable } from "svelte/store";
import { afterEach, expect, test, vi } from "vitest";
import { useMayfail } from "../src";

const lifecycle = vi.hoisted(() => ({ cleanups: [] as Array<() => void> }));

vi.mock("svelte", () => ({
  onDestroy: (cleanup: () => void) => {
    lifecycle.cleanups.push(cleanup);
  },
}));

afterEach(() => {
  for (const cleanup of lifecycle.cleanups.splice(0)) cleanup();
});

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

test("exposes the latest successful result", async () => {
  const operation = useMayfail(async (value: number) => value * 2);

  await expect(operation.execute(21)).resolves.toEqual([42, null]);

  expect(get(operation.error)).toBeNull();
  expect(get(operation.isPending)).toBe(false);
  expect(get(operation.value)).toBe(42);
});

test("captures errors instead of throwing", async () => {
  const error = new Error("unavailable");
  const operation = useMayfail(() => {
    throw error;
  });

  await expect(operation.execute()).resolves.toEqual([null, error]);

  expect(get(operation.error)).toBe(error);
});

test("sets pending state while an execution is running", async () => {
  const pending = deferred<string>();
  const operation = useMayfail(() => pending.promise);
  const execution = operation.execute();

  expect(get(operation.error)).toBeNull();
  expect(get(operation.isPending)).toBe(true);
  expect(get(operation.result)).toBeNull();
  expect(get(operation.value)).toBeNull();

  pending.resolve("complete");
  await execution;

  expect(get(operation.isPending)).toBe(false);
  expect(get(operation.result)).toEqual(["complete", null]);
  expect(get(operation.value)).toBe("complete");
});

test("only lets the latest overlapping execution update state", async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const runner = vi
    .fn<() => Promise<string>>()
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const operation = useMayfail(runner);

  const firstExecution = operation.execute();
  const secondExecution = operation.execute();

  first.resolve("stale");
  await firstExecution;

  expect(get(operation.isPending)).toBe(true);
  expect(get(operation.result)).toBeNull();

  second.resolve("latest");
  await secondExecution;

  expect(get(operation.isPending)).toBe(false);
  expect(get(operation.result)).toEqual(["latest", null]);
  expect(get(operation.value)).toBe("latest");
});

test("reset invalidates an execution that is still in flight", async () => {
  const pending = deferred<string>();
  const operation = useMayfail(() => pending.promise);
  const execution = operation.execute();

  operation.reset();

  expect(get(operation.isPending)).toBe(false);
  expect(get(operation.result)).toBeNull();

  pending.resolve("ignored");
  await execution;

  expect(get(operation.isPending)).toBe(false);
  expect(get(operation.result)).toBeNull();
});

test("uses the latest operation from a readable store", async () => {
  const firstOperation = vi.fn((value: number) => value);
  const secondOperation = vi.fn((value: number) => value * 2);
  const runner = writable(firstOperation);
  const operation = useMayfail(runner);

  runner.set(secondOperation);

  await expect(operation.execute(21)).resolves.toEqual([42, null]);
  expect(firstOperation).not.toHaveBeenCalled();
  expect(secondOperation).toHaveBeenCalledOnce();
});

test("preserves an undefined success value in the result shape", async () => {
  const operation = useMayfail(() => undefined);

  await operation.execute();

  expect(get(operation.result)).toEqual([undefined, null]);
  expect(get(operation.value)).toBeUndefined();
  expect(get(operation.error)).toBeNull();
});

test("does not update state after its component is destroyed", async () => {
  const pending = deferred<string>();
  const operation = useMayfail(() => pending.promise);
  const execution = operation.execute();
  const cleanup = lifecycle.cleanups.pop();

  cleanup?.();
  pending.resolve("complete");

  await expect(execution).resolves.toEqual(["complete", null]);
  expect(get(operation.isPending)).toBe(false);
  expect(get(operation.result)).toBeNull();
});
