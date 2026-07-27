# tcatch

[![CI](https://img.shields.io/github/actions/workflow/status/clemenzi/tcatch/ci.yml?label=CI)](https://github.com/clemenzi/tcatch/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/tcatch)](https://www.npmjs.com/package/tcatch)
[![License](https://img.shields.io/npm/l/tcatch)](https://github.com/clemenzi/tcatch/blob/main/LICENSE)
[![Website](https://img.shields.io/badge/website-visit-2ea44f)](https://clemenzi.github.io/tcatch/)

Tiny, dependency-free error handling for synchronous and asynchronous JavaScript and TypeScript functions.

## Install

```bash
npm install tcatch
```

## How it works

Synchronous callbacks return a tuple immediately:

```ts
import { tcatch } from "tcatch";

const [value, error] = tcatch(() => JSON.parse(input));
```

Async callbacks return a promise of the same tuple:

```ts
const [user, error] = await tcatch(() => fetch("/api/me").then((response) => response.json()));
```

Success returns `[value, null]`; thrown errors and rejected promises return `[null, error]`. Unknown thrown values are normalized to `Error` instances.

The function is also available as `tc` and `tryCatch`:

```ts
import { tc, tryCatch } from "tcatch";
```

See the [documentation site](https://clemenzi.github.io/tcatch/) for the full API.

## License

MIT
