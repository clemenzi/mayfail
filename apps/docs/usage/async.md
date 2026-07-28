# Async

The callback passed to `mayfail` can return a promise. Await the same tuple at the call site.

```ts
import { mayfail } from "mayfail";

const [user, error] = await mayfail(() => fetch("/api/me").then((response) => response.json()));

if (error) {
  console.error(error.message);
} else {
  console.log(user);
}
```

The returned promise resolves to the same `Result<T>` shape used by synchronous operations.
