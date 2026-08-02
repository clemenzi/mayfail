# @mayfail/log

Logging for [`mayfail`](https://www.npmjs.com/package/mayfail) result tuples.

## Installation

```sh
pnpm add mayfail @mayfail/log
```

## Usage

`log` writes failed results and returns the original tuple unchanged.

```ts
import { log } from "@mayfail/log";
import { mayfail } from "mayfail";

const [payload, error] = log(
  mayfail(() => JSON.parse(input)),
  {
    message: "Could not parse payload",
    context: { inputLength: input.length },
  },
);
```

Asynchronous results keep their promise shape.

```ts
const [user, error] = await log(
  mayfail(() => fetch("/api/me").then((response) => response.json())),
  { level: "warn" },
);
```

By default failures call `console.error("mayfail operation failed", error)`.
Pass `logger` to integrate any logger exposing `debug`, `info`, `warn`, and
`error` methods.
