import { expect, test } from "vitest";
import { mayfail } from "../src";

test("returns a value tuple synchronously", () => {
  expect(mayfail(() => 42)).toEqual([42, null]);
});

test("returns an error tuple synchronously", () => {
  const error = new Error("nope");

  expect(
    mayfail(() => {
      throw error;
    }),
  ).toEqual([null, error]);
});

test("returns a promise tuple for an async callback", async () => {
  await expect(mayfail(async () => "done")).resolves.toEqual(["done", null]);
});

test("catches an async rejection", async () => {
  const error = new Error("nope");

  await expect(mayfail(() => Promise.reject(error))).resolves.toEqual([null, error]);
});
