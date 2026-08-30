# Introduction

`mayfail` makes risky operations explicit without changing their shape more than necessary.

Every call returns a `Result<T>` tuple:

```ts
type Result<T> = [T, null] | [null, Error];
```

The success value and error always occupy the same position. There is no wrapper object and no hidden control flow.

```ts
const [payload, error] = mayfail(() => JSON.parse(input));
```

Use it where throwing is more noise than signal, while keeping synchronous code synchronous and awaiting asynchronous code normally.

## Next steps

- [Install `mayfail`](/install)
- [Learn the basic usage pattern](/usage/basic-usage)
- [Add logging with `@mayfail/log`](/usage/log)
- [Use the React adapter](/frameworks/react)
- [Use the Svelte adapter](/frameworks/svelte)
- [Use the Vue adapter](/frameworks/vue)
