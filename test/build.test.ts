import { execFile, spawn } from "node:child_process";
import { lstat } from "node:fs/promises";
import { createServer } from "node:net";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const running: ReturnType<typeof spawn>[] = [];

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") return reject(new Error("No loopback port available."));
      server.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

afterEach(async () => {
  await Promise.all(running.splice(0).map((child) => new Promise<void>((resolve) => {
    if (child.exitCode !== null) return resolve();
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
  })));
});

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

  it("@claim:local-site serves the documented Vite site on loopback", async () => {
    const port = await freePort();
    const child = spawn("npm", ["run", "dev:site", "--", "--host", "127.0.0.1", "--port", String(port)], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    running.push(child);
    const output: string[] = [];
    child.stdout?.on("data", (chunk: Buffer) => output.push(chunk.toString()));
    child.stderr?.on("data", (chunk: Buffer) => output.push(chunk.toString()));
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Vite did not start: ${output.join("")}`)), 15_000);
      const started = () => {
        if (output.join("").includes(`127.0.0.1:${port}`)) {
          clearTimeout(timeout);
          resolve();
        }
      };
      child.stdout?.on("data", started);
      child.stderr?.on("data", started);
      child.once("exit", (code) => reject(new Error(`Vite exited early (${code}): ${output.join("")}`)));
    });
    const response = await fetch(`http://127.0.0.1:${port}/`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Catch changed keyboard focus and status messages.");
  }, 30_000);
});
