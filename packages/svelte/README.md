# @mayfail/svelte

Svelte integration for [`mayfail`](https://www.npmjs.com/package/mayfail).

`useMayfail` runs a synchronous or asynchronous operation and exposes its latest result as Svelte stores, without requiring `try`/`catch` in event handlers.

It is safe to use with overlapping async calls: every `execute` resolves with its own result, while only the latest call can update the stores.

## Installation

```sh
pnpm add @mayfail/svelte
```

Svelte 4 or later is required.

## Usage

Pass an operation to `useMayfail`, then call `execute` from an event handler.

```svelte
<script lang="ts">
  import { useMayfail } from "@mayfail/svelte";

  let name = "Ada";
  const { execute, error, isPending, value } = useMayfail(async (nextName: string) => {
    const response = await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({ name: nextName }),
    });

    if (!response.ok) throw new Error("Unable to save profile");

    return response.json() as Promise<{ id: string; name: string }>;
  });
</script>

<form on:submit|preventDefault={() => void execute(name)}>
  <label>
    Name
    <input bind:value={name} />
  </label>
  <button disabled={$isPending} type="submit">
    {$isPending ? "Saving…" : "Save profile"}
  </button>
  {#if $error}<p role="alert">{$error.message}</p>{/if}
  {#if $value}<p>Saved {$value.name}</p>{/if}
</form>
```

## API

`useMayfail(operation)` returns:

- `execute(...arguments)`: runs `operation` and always resolves to `[value, null]` or `[null, error]`.
- `value`: a readable store containing the latest successful value, or `null`.
- `error`: a readable store containing the latest error, or `null`.
- `result`: a readable store containing the latest result tuple, or `null` before the first execution or after reset.
- `isPending`: a readable boolean store for the latest execution.
- `reset()`: clears the stored result and pending state. Any execution already in flight can still resolve to its caller, but can no longer update the stores.

Thrown values and rejected promises are normalized to `Error` instances by `mayfail`.

Pass a readable store containing the operation when it needs to change after setup. `execute` reads the current operation from that store each time it runs.

## License

MIT
