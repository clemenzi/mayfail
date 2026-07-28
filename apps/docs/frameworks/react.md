# React

`@mayfail/react` gives an operation state without forcing a request library or a particular UI pattern.

## `useMayfail`

Pass an operation to `useMayfail`. Call `execute` from an event handler and render from the returned state.

```tsx
import { useMayfail } from "@mayfail/react";

function ProfileButton() {
  const { execute, error, isPending, value } = useMayfail(async () => {
    const response = await fetch("/api/me");
    if (!response.ok) throw new Error("Unable to load your profile");
    return response.json() as Promise<{ name: string }>;
  });

  return (
    <section>
      <button disabled={isPending} onClick={() => void execute()}>
        {isPending ? "Loading…" : "Load profile"}
      </button>
      {error && <p role="alert">{error.message}</p>}
      {value && <p>Welcome back, {value.name}.</p>}
    </section>
  );
}
```

`execute` always returns `Promise<Result<T>>`, while `result`, `value`, `error`, and `isPending` represent the latest run.

When calls overlap, each returned promise resolves normally, but only the latest call updates the rendered state. Call `reset()` to clear the result and prevent executions already in flight from updating it later.
