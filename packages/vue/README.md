# @mayfail/vue

Vue integration for [`mayfail`](https://www.npmjs.com/package/mayfail).

`useMayfail` runs a synchronous or asynchronous operation and exposes its latest result as Vue refs, without requiring `try`/`catch` in event handlers.

It is safe to use with overlapping async calls: every `execute` resolves with its own result, while only the latest call can update the composable state.

## Installation

```sh
pnpm add @mayfail/vue
```

Vue 3.3 or later is required.

## Usage

Pass an operation to `useMayfail`, then call `execute` from an event handler.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useMayfail } from "@mayfail/vue";

const name = ref("Ada");
const { execute, error, isPending, value } = useMayfail(async (nextName: string) => {
  const response = await fetch("/api/profile", {
    method: "POST",
    body: JSON.stringify({ name: nextName }),
  });

  if (!response.ok) throw new Error("Unable to save profile");

  return response.json() as Promise<{ id: string; name: string }>;
});

const save = () => {
  void execute(name.value);
};
</script>

<template>
  <form @submit.prevent="save">
    <label>
      Name
      <input v-model="name" />
    </label>
    <button :disabled="isPending" type="submit">
      {{ isPending ? "Saving…" : "Save profile" }}
    </button>
    <p v-if="error" role="alert">{{ error.message }}</p>
    <p v-if="value">Saved {{ value.name }}</p>
  </form>
</template>
```

## API

`useMayfail(operation)` returns:

- `execute(...arguments)`: runs `operation` and always resolves to `[value, null]` or `[null, error]`.
- `value`: a readonly ref containing the latest successful value, or `null`.
- `error`: a readonly ref containing the latest error, or `null`.
- `result`: a readonly ref containing the latest result tuple, or `null` before the first execution or after reset.
- `isPending`: a readonly boolean ref for the latest execution.
- `reset()`: clears the stored result and pending state. Any execution already in flight can still resolve to its caller, but can no longer update the composable state.

Thrown values and rejected promises are normalized to `Error` instances by `mayfail`.

Pass a `Ref` containing the operation when it needs to change after setup. `execute` reads the current operation from that ref each time it runs.

## License

MIT
