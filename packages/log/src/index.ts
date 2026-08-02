import type { Result } from "mayfail";

export type LogLevel = "debug" | "error" | "info" | "warn";

export type Logger = Record<LogLevel, (...data: unknown[]) => void>;

export interface LogOptions {
  /** Extra structured data passed to the logger after the error. */
  context?: unknown;
  /** Logging level. Defaults to `error`. */
  level?: LogLevel;
  /** Logger implementation. Defaults to the global console. */
  logger?: Logger;
  /** Message passed to the logger before the error. */
  message?: string;
}

const DEFAULT_MESSAGE = "mayfail operation failed";

function logResult<T>(result: Result<T>, options: LogOptions): Result<T> {
  const error = result[1];

  if (error !== null) {
    const { context, level = "error", logger = console, message = DEFAULT_MESSAGE } = options;

    if (context === undefined) {
      logger[level](message, error);
    } else {
      logger[level](message, error, context);
    }
  }

  return result;
}

export function log<T>(result: Promise<Result<T>>, options?: LogOptions): Promise<Result<T>>;
export function log<T>(result: Result<T>, options?: LogOptions): Result<T>;
export function log<T>(result: Result<T> | Promise<Result<T>>, options?: LogOptions): Result<T> | Promise<Result<T>>;
export function log<T>(
  result: Result<T> | Promise<Result<T>>,
  options: LogOptions = {},
): Result<T> | Promise<Result<T>> {
  if (result instanceof Promise) {
    return result.then((resolvedResult) => logResult(resolvedResult, options));
  }

  return logResult(result, options);
}
