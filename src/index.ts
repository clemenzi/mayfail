export type Result<T> = [T, null] | [null, Error];

const fail = (error: unknown): Result<never> => [
  null,
  error instanceof Error ? error : Error(String(error)),
];

function tcatch<T>(f: () => Promise<T>): Promise<Result<T>>;
function tcatch<T>(f: () => T): Result<T>;
function tcatch<T>(f: () => T | Promise<T>): Result<T> | Promise<Result<T>>;
function tcatch<T>(f: () => T | Promise<T>): Result<T> | Promise<Result<T>> {
  try {
    const value = f();

    return (value as Promise<T> | null | undefined)?.then
      ? (value as Promise<T>).then((value) => [value, null] as Result<T>, fail)
      : ([value, null] as Result<T>);
  } catch (error) {
    return fail(error);
  }
}

export { tcatch, tcatch as tc, tcatch as tryCatch };
