import { effectScope, ref, type Ref } from "vue";
import { expect, test, vi } from "vitest";
import { useMayfail, type UseMayfailReturn } from "../src";

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function setup<Arguments extends unknown[], Value>(
  operation:
    | ((...arguments_: Arguments) => Value | Promise<Value>)
    | Ref<(...arguments_: Arguments) => Value | Promise<Value>>,
) {
  const scope = effectScope();
  const composable = scope.run(() => useMayfail(operation)) as UseMayfailReturn<
    Arguments,
    Awaited<Value>
  >;

  return { composable, scope };
}

test("exposes the latest successful result", async () => {
  const { composable } = setup(async (value: number) => value * 2);

  await expect(composable.execute(21)).resolves.toEqual([42, null]);

  expect(composable.error.value).toBeNull();
  expect(composable.isPending.value).toBe(false);
  expect(composable.value.value).toBe(42);
});

test("captures errors instead of throwing", async () => {
  const error = new Error("unavailable");
  const { composable } = setup(() => {
    throw error;
  });

  await expect(composable.execute()).resolves.toEqual([null, error]);

  expect(composable.error.value).toBe(error);
});

test("sets pending state while an execution is running", async () => {
  const pending = deferred<string>();
  const { composable } = setup(() => pending.promise);
  const execution = composable.execute();

  expect(composable).toMatchObject({
    error: { value: null },
    isPending: { value: true },
    result: { value: null },
    value: { value: null },
  });

  pending.resolve("complete");
  await execution;

  expect(composable.isPending.value).toBe(false);
  expect(composable.result.value).toEqual(["complete", null]);
  expect(composable.value.value).toBe("complete");
});

test("only lets the latest overlapping execution update state", async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const operation = vi
    .fn<() => Promise<string>>()
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const { composable } = setup(operation);

  const firstExecution = composable.execute();
  const secondExecution = composable.execute();

  first.resolve("stale");
  await firstExecution;

  expect(composable.isPending.value).toBe(true);
  expect(composable.result.value).toBeNull();

  second.resolve("latest");
  await secondExecution;

  expect(composable.isPending.value).toBe(false);
  expect(composable.result.value).toEqual(["latest", null]);
  expect(composable.value.value).toBe("latest");
});

test("reset invalidates an execution that is still in flight", async () => {
  const pending = deferred<string>();
  const { composable } = setup(() => pending.promise);
  const execution = composable.execute();

  composable.reset();

  expect(composable.isPending.value).toBe(false);
  expect(composable.result.value).toBeNull();

  pending.resolve("ignored");
  await execution;

  expect(composable.isPending.value).toBe(false);
  expect(composable.result.value).toBeNull();
});

test("uses the latest operation from a ref", async () => {
  const firstOperation = vi.fn((value: number) => value);
  const secondOperation = vi.fn((value: number) => value * 2);
  const operation = ref(firstOperation);
  const { composable } = setup(operation);

  operation.value = secondOperation;

  await expect(composable.execute(21)).resolves.toEqual([42, null]);
  expect(firstOperation).not.toHaveBeenCalled();
  expect(secondOperation).toHaveBeenCalledOnce();
});

test("preserves an undefined success value in the result shape", async () => {
  const { composable } = setup(() => undefined);

  await composable.execute();

  expect(composable.result.value).toEqual([undefined, null]);
  expect(composable.value.value).toBeUndefined();
  expect(composable.error.value).toBeNull();
});

test("does not update state after its effect scope is stopped", async () => {
  const pending = deferred<string>();
  const { composable, scope } = setup(() => pending.promise);
  const execution = composable.execute();

  scope.stop();
  pending.resolve("complete");

  await expect(execution).resolves.toEqual(["complete", null]);
  expect(composable.result.value).toBeNull();
});
