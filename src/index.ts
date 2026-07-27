export type Result<T> = [T, null] | [null, Error];

function mayfail<T>(
  f: () => T,
): T extends Promise<infer Value> ? Promise<Result<Value>> : Result<T>;
function mayfail<T>(f: () => T | Promise<T>): Result<T> | Promise<Result<T>> {
  const failure = (error: unknown): Result<T> => [
    null,
    error instanceof Error ? error : Error(String(error)),
  ];

  try {
    const value = f();

    if (value instanceof Promise) {
      return value.then<Result<T>, Result<T>>((resolvedValue) => [resolvedValue, null], failure);
    }

    return [value, null];
  } catch (error) {
    return failure(error);
  }
}

export { mayfail };
