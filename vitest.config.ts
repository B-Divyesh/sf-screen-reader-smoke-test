import { defineConfig } from "vitest/config";

export default defineConfig({
  root: ".",
  test: {
    include: ["test/**/*.test.ts"],
    fileParallelism: false,
    globalSetup: ["./test/global-setup.ts"],
    hookTimeout: 60_000
  }
});
