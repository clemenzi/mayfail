---
layout: home

hero:
  name: mayfail
  tagline: A tiny Result tuple for the code paths where throwing is more noise than signal.
  actions:
    - theme: brand
      text: Read the docs
      link: /introduction

features:
  - title: One honest shape
    details: Success is [value, null]. Failure is [null, error]. No wrapper object and no hidden control flow.
  - title: Sync or async
    details: Keep synchronous code synchronous. Promises receive the exact same result shape when awaited.
  - title: React-ready
    details: "@mayfail/react turns an operation into a stable runner with pending, value, error, and reset state."
---
