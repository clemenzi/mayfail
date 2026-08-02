import { mayfail } from "mayfail";
import { describe, expect, test, vi } from "vitest";
import { log, type Logger } from "../src";

function createLogger() {
  const write = vi.fn();
  const logger: Logger = {
    debug: write,
    error: write,
    info: write,
    warn: write,
  };

  return { logger, write };
}

describe("log", () => {
  test("returns a successful synchronous result without logging", () => {
    const { logger, write } = createLogger();
    const result = mayfail(() => 42);

    expect(log(result, { logger })).toBe(result);
    expect(write).not.toHaveBeenCalled();
  });

  test("logs a synchronous failure and preserves its result", () => {
    const { logger, write } = createLogger();
    const error = new Error("nope");
    const context = { requestId: "req-1" };
    const result = mayfail(() => {
      throw error;
    });

    expect(log(result, { context, level: "warn", logger, message: "Request failed" })).toBe(result);
    expect(write).toHaveBeenCalledOnce();
    expect(write).toHaveBeenCalledWith("Request failed", error, context);
  });

  test("logs an asynchronous failure and resolves to its result", async () => {
    const { logger, write } = createLogger();
    const error = new Error("async nope");
    const resultPromise = mayfail(async () => {
      throw error;
    });

    const result = await log(resultPromise, { logger });

    expect(result).toEqual([null, error]);
    expect(write).toHaveBeenCalledWith("mayfail operation failed", error);
  });

  test("supports direct tuple destructuring", () => {
    const { logger } = createLogger();
    const [value, error] = log(
      mayfail(() => "done"),
      { logger },
    );

    expect(value).toBe("done");
    expect(error).toBeNull();
  });
});
