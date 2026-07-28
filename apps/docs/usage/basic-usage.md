# Basic Usage

`mayfail` returns `[value, null]` on success and `[null, error]` on failure.

```ts
import { mayfail } from "mayfail";

const [payload, error] = mayfail(() => JSON.parse(input));

if (error) {
  console.error(error.message);
} else {
  console.log(payload);
}
```

Thrown values that are not `Error` instances are normalized to an `Error`, so the error branch remains consistent.

For operations that return a promise, see [Async](/usage/async).
