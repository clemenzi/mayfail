import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  minify: true,
  deps: { neverBundle: ["vue", "mayfail"] },
});
