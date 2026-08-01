# mayfail

Small, explicit error handling for TypeScript.

This repository is a pnpm + Turborepo workspace:

- `packages/mayfail`: the dependency-free `mayfail` result tuple helper.
- `packages/react`: `@mayfail/react`, including the `useMayfail` hook.
- `packages/svelte`: `@mayfail/svelte`, including the `useMayfail` store integration.
- `packages/vue`: `@mayfail/vue`, including the `useMayfail` composable.
- `apps/docs`: the static VitePress documentation site, published to GitHub Pages.

## Development

```sh
pnpm install
pnpm build
pnpm test
```

Run the docs locally with `pnpm docs:dev`. The production output is generated in `apps/docs/.vitepress/dist`.

## Packages

```ts
import { mayfail } from "mayfail";

const [value, error] = await mayfail(() => fetch("/api/me"));
```

For React, install `@mayfail/react` and use `useMayfail` to run an operation while retaining its latest `value`, `error`, `isPending`, and `result` state.

For Svelte, install `@mayfail/svelte`. Its `useMayfail` integration exposes the same operation state as readable Svelte stores.

For Vue, install `@mayfail/vue`. Its `useMayfail` composable exposes the same operation state as readonly Vue refs.

## License

MIT
