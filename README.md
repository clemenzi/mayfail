# tcatch

Tiny, dependency-free error handling for synchronous and asynchronous functions.

```ts
import { tcatch } from 'tcatch'

const [user, error] = await tcatch(() => fetch('/api/me').then((r) => r.json()))
const [config, configError] = tcatch(() => JSON.parse(input))
```

`tcatch` preserves the callback's execution model:

- A synchronous callback returns `[value, null]` or `[null, Error]` immediately.
- An async callback returns `Promise<[value, null] | [null, Error]>`.

It has no runtime dependencies. `tc` and `tryCatch` are aliases for `tcatch`.

## Development

- Install dependencies:

```bash
npm install
```

- Run the unit tests:

```bash
npm run test
```

- Build the library:

```bash
npm run build
```
