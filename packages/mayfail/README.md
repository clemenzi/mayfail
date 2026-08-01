# mayfail

Small, explicit error handling for TypeScript.

`mayfail` turns a synchronous throw or an asynchronous rejection into a predictable result tuple. Successful operations return `[value, null]`; failed operations return `[null, error]`.

```ts
type Result<T> = [T, null] | [null, Error];
```

## Installation

```sh
pnpm add mayfail
```

## Usage

Wrap the operation in a callback and branch on the error value.

```ts
import { mayfail } from "mayfail";

const [payload, error] = mayfail(() => JSON.parse(input));

if (error) {
  console.error(error.message);
} else {
  console.log(payload);
}
```

The callback may also return a promise. Await the same tuple shape at the call site.

```ts
const [user, error] = await mayfail(() => fetch("/api/me").then((response) => response.json()));

if (error) {
  console.error(error.message);
} else {
  console.log(user);
}
```

## React

For React state around an operation, use [`@mayfail/react`](https://www.npmjs.com/package/@mayfail/react) and its `useMayfail` hook.

## Svelte

For Svelte stores around an operation, use [`@mayfail/svelte`](https://www.npmjs.com/package/@mayfail/svelte) and its `useMayfail` integration.

## Vue

For Vue refs around an operation, use [`@mayfail/vue`](https://www.npmjs.com/package/@mayfail/vue) and its `useMayfail` composable.

## Documentation

Read the full documentation at [clemenzi.github.io/mayfail](https://clemenzi.github.io/mayfail/).

## License

MIT
