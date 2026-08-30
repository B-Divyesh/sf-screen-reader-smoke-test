import { execFile } from "node:child_process";
import { lstat } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, inject, it } from "vitest";

const execFileAsync = promisify(execFile);
const siteOrigin = inject("siteOrigin");

describe("documented build and development commands", () => {
  it("@claim:build-artifacts produces the library, site, and versioned download", async () => {
    await execFileAsync("npm", ["run", "build"]);
    for (const path of [
      "dist/library/index.js",
      "dist/library/index.cjs",
      "dist/library/index.d.ts",
      "dist/site/index.html",
      "dist/site/downloads/screen-reader-smoke-test-0.1.0.tgz"
    ]) expect((await lstat(path)).isFile()).toBe(true);
  }, 90_000);

  it("@claim:local-site serves the documented Vite site from the shared test server", async () => {
    const response = await fetch(`${siteOrigin}/`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Catch changed keyboard focus and status messages.");
  });
});
