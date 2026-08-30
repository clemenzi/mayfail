# Log

`@mayfail/log` adds logging to results returned by `mayfail` without changing
their shape or flow.

## Installation

```sh
npm install mayfail @mayfail/log
```

```sh
pnpm add mayfail @mayfail/log
```

## Basic usage

Pass a result from `mayfail` to `log`. Successful results are not logged;
failed results are written with `console.error`, and the original result is
returned unchanged.

```ts
import { mayfail } from "mayfail";
import { log } from "@mayfail/log";

const result = log(mayfail(() => JSON.parse(input)));

const [payload, error] = result;
```

The default message is `mayfail operation failed`. Replace it and add
structured data with `message` and `context`:

```ts
const [payload, error] = log(
  mayfail(() => JSON.parse(input)),
  {
    message: "Could not parse payload",
    context: { inputLength: input.length },
  },
);
```

When `context` is provided, it is passed to the logger after the error:
`logger[level](message, error, context)`.

## Async results

For a `Promise<Result<T>>`, `log` returns a promise with the same shape. You
can use `await` as usual:

```ts
const [user, error] = await log(
  mayfail(() => fetch("/api/me").then((response) => response.json())),
  { level: "warn", message: "Could not load current user" },
);
```

Logging occurs when the promise resolves. A rejected promise remains
rejected: `log` observes results from `mayfail`; it does not replace
`mayfail` for promise rejection handling.

## Options

| Option    | Type                                     | Default                    | Description                                               |
| --------- | ---------------------------------------- | -------------------------- | --------------------------------------------------------- |
| `message` | `string`                                 | `mayfail operation failed` | Message written before the error.                         |
| `level`   | `"debug" \| "error" \| "info" \| "warn"` | `"error"`                  | Level used by the logger.                                 |
| `context` | `unknown`                                | —                          | Structured data passed after the error.                   |
| `logger`  | `Logger`                                 | `console`                  | Logger with `debug`, `error`, `info`, and `warn` methods. |

## Custom logger

Use `logger` to connect `@mayfail/log` to your application's logging system:

```ts
import { log, type Logger } from "@mayfail/log";

const logger: Logger = {
  debug: (...data) => appLogger.debug(data),
  error: (...data) => appLogger.error(data),
  info: (...data) => appLogger.info(data),
  warn: (...data) => appLogger.warn(data),
};

const result = log(mayfail(operation), {
  logger,
  level: "info",
});
```

`log` does not throw if the logger fails. It still returns the original result,
so logging cannot alter the operation's result flow.
