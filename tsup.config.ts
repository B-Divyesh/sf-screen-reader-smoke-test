import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    outDir: "dist/library",
    outExtension({ format }) {
      return { js: format === "cjs" ? ".cjs" : ".js" };
    },
    external: ["playwright"]
  },
  {
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    splitting: false,
    sourcemap: true,
    clean: false,
    banner: { js: "#!/usr/bin/env node" },
    outDir: "dist/library",
    external: ["playwright"]
  }
]);
