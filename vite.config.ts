import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  build: {
    target: "es2022",
    outDir: "../dist/site",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "site/index.html"),
        demo: resolve(import.meta.dirname, "site/demo/index.html"),
        privacy: resolve(import.meta.dirname, "site/privacy/index.html"),
        terms: resolve(import.meta.dirname, "site/terms/index.html"),
        notFound: resolve(import.meta.dirname, "site/404.html")
      }
    }
  }
});
