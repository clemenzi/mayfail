# Svelte

`@mayfail/svelte` exposes operation state as Svelte stores without forcing a request library or a particular UI pattern.

## Install

`@mayfail/svelte` requires Svelte 4 or later. Install it in an existing Svelte application:

```sh
pnpm add @mayfail/svelte
```

```sh
npm install @mayfail/svelte
```

The adapter declares `svelte` as a peer dependency, so your application provides Svelte. `mayfail` is installed automatically as the adapter's runtime dependency; it does not need to be added separately.

## `useMayfail`

Pass an operation to `useMayfail`. Call `execute` from an event handler and render from the returned stores.

```svelte
<script lang="ts">
  import { useMayfail } from "@mayfail/svelte";

  const { execute, error, isPending, value } = useMayfail(async () => {
    const response = await fetch("/api/me");
    if (!response.ok) throw new Error("Unable to load your profile");
    return response.json() as Promise<{ name: string }>;
  });
</script>

<section>
  <button disabled={$isPending} on:click={() => void execute()}>
    {$isPending ? "Loading…" : "Load profile"}
  </button>
  {#if $error}<p role="alert">{$error.message}</p>{/if}
  {#if $value}<p>Welcome back, {$value.name}.</p>{/if}
</section>
```

`execute` always returns `Promise<Result<T>>`, while `result`, `value`, `error`, and `isPending` are readable stores representing the latest run.

When calls overlap, each returned promise resolves normally, but only the latest call updates the rendered state. Call `reset()` to clear the result and prevent executions already in flight from updating it later.

If the operation can change after setup, pass it as a Svelte readable store. `execute` reads the current function from that store on every call.
