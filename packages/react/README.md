# @mayfail/react

React integration for [`mayfail`](https://www.npmjs.com/package/mayfail).

`useMayfail` runs a synchronous or asynchronous operation and keeps its latest result in React state, without requiring `try`/`catch` in event handlers.

## Installation

```sh
pnpm add @mayfail/react
```

`react` 18 or later is required.

## Usage

Pass an operation to `useMayfail`, then call `execute` from an event handler.

```tsx
import { useMayfail } from "@mayfail/react";

function SaveProfile() {
  const { execute, error, isPending, value } = useMayfail(async (name: string) => {
    const response = await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (!response.ok) throw new Error("Unable to save profile");

    return response.json() as Promise<{ id: string; name: string }>;
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void execute("Ada");
      }}
    >
      <button disabled={isPending} type="submit">
        {isPending ? "Saving…" : "Save profile"}
      </button>
      {error && <p role="alert">{error.message}</p>}
      {value && <p>Saved {value.name}</p>}
    </form>
  );
}
```

## API

`useMayfail(operation)` returns:

- `execute(...arguments)`: runs `operation` and always resolves to `[value, null]` or `[null, error]`.
- `value`: the value from the latest successful execution, or `null`.
- `error`: the error from the latest failed execution, or `null`.
- `result`: the latest result tuple, or `null` before the first execution or after reset.
- `isPending`: `true` while the latest execution is running.
- `reset()`: clears the stored result and pending state.

Thrown values and rejected promises are normalized to `Error` instances by `mayfail`.

## License

MIT
