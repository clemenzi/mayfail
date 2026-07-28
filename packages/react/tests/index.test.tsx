// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";
import { useMayfail } from "../src";

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
