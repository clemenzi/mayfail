# mayfail

[![CI](https://img.shields.io/github/actions/workflow/status/clemenzi/mayfaill/ci.yml?label=CI)](https://github.com/clemenzi/mayfaill/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/mayfail)](https://www.npmjs.com/package/mayfail)
[![License](https://img.shields.io/npm/l/mayfail)](https://github.com/clemenzi/mayfaill/blob/main/LICENSE)
[![Website](https://img.shields.io/badge/website-visit-2ea44f)](https://clemenzi.github.io/mayfaill/)

Tiny, dependency-free error handling for synchronous and asynchronous JavaScript and TypeScript functions.

## Install

```bash
npm install mayfail
```

## How it works

Synchronous callbacks return a tuple immediately:

```ts
import { mayfaill } from "mayfail";

const [value, error] = mayfaill(() => JSON.parse(input));
```

Async callbacks return a promise of the same tuple:

```ts
const [user, error] = await mayfaill(() => fetch("/api/me").then((response) => response.json()));
```

Success returns `[value, null]`; thrown errors and rejected promises return `[null, error]`. Unknown thrown values are normalized to `Error` instances.

The function is also available as `tc` and `tryCatch`:

```ts
import { tc, tryCatch } from "mayfail";
```

See the [documentation site](https://clemenzi.github.io/mayfaill/) for the full API.

## License

MIT
