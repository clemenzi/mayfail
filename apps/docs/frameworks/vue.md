# Vue

`@mayfail/vue` exposes operation state as Vue refs without forcing a request library or a particular UI pattern.

## Install

`@mayfail/vue` requires Vue 3.3 or later. Install it in an existing Vue application:

```sh
pnpm add @mayfail/vue
```

```sh
npm install @mayfail/vue
```

The adapter declares `vue` as a peer dependency, so your application provides Vue. `mayfail` is installed automatically as the adapter's runtime dependency; it does not need to be added separately.

## `useMayfail`

Pass an operation to `useMayfail`. Call `execute` from an event handler and render from the returned refs.

```vue
<script setup lang="ts">
import { useMayfail } from "@mayfail/vue";

const { execute, error, isPending, value } = useMayfail(async () => {
  const response = await fetch("/api/me");
  if (!response.ok) throw new Error("Unable to load your profile");
  return response.json() as Promise<{ name: string }>;
});
</script>

<template>
  <section>
    <button :disabled="isPending" @click="execute()">
      {{ isPending ? "Loading…" : "Load profile" }}
    </button>
    <p v-if="error" role="alert">{{ error.message }}</p>
    <p v-if="value">Welcome back, {{ value.name }}.</p>
  </section>
</template>
```

`execute` always returns `Promise<Result<T>>`, while `result`, `value`, `error`, and `isPending` are readonly refs representing the latest run.

When calls overlap, each returned promise resolves normally, but only the latest call updates the rendered state. Call `reset()` to clear the result and prevent executions already in flight from updating it later.

If the operation can change after setup, pass it as a Vue `ref`. `execute` reads the current function from that ref on every call.
