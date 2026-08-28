import { createServer } from "node:http";
import { lstat, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repository = resolve(process.cwd());
let submitValue = "Create account";
const fixture = () => `<!doctype html><html lang="en"><head><title>Signup fixture</title></head><body>
<main><h1>Create an account</h1><form><label for="email">Email address</label><input id="email" type="email" required><input type="submit" value="${submitValue}"></form><p role="status"></p></main>
<script>document.querySelector('form').addEventListener('submit',event=>{event.preventDefault();document.querySelector('[role=status]').textContent='Account created for '+document.querySelector('input').value})</script>
</body></html>`;

let server: ReturnType<typeof createServer>;
let origin: string;

beforeAll(async () => {
  server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixture());
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Fixture server did not bind.");
  origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((done, fail) => server.close((error) => error ? fail(error) : done()));
});

describe("published package consumer", () => {
  it("runs the npm bin through its symlink to update and recheck a local flow", async () => {
    const consumer = await mkdtemp(join(tmpdir(), "announce-test-consumer-"));
    let tarball: string | undefined;
    try {
      await execFileAsync("npm", ["run", "build"], { cwd: repository });
      const { stdout } = await execFileAsync("npm", ["pack", "--json", "--ignore-scripts"], { cwd: repository });
      const packed = JSON.parse(stdout) as Array<{ filename: string }>;
      tarball = join(repository, packed[0]!.filename);

      await execFileAsync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--no-package-lock", tarball], { cwd: consumer });
      const configPath = join(consumer, "announce-check.config.mjs");
      const expectedPath = join(consumer, "announce-check.expected.json");
      await writeFile(configPath, `export default {
        name: "Packaged signup confirmation",
        url: "${origin}",
        expectedPath: "./announce-check.expected.json",
        steps: [
          { action: "fill", target: { label: "Email address" }, value: "consumer@example.test" },
          { action: "click", target: { selector: "input[type=submit]" } },
          { action: "wait", for: 60 }
        ]
      };`);

      const bin = join(consumer, "node_modules", ".bin", "announce-check");
      expect((await lstat(bin)).isSymbolicLink()).toBe(true);
      const runBin = (args: string[]) => execFileAsync(process.execPath, [bin, ...args], { cwd: consumer });
      const help = await runBin(["--help"]);
      expect(help.stdout).toContain("Verify focus semantics and ARIA live-region changes");

      const updated = await runBin(["announce-check.config.mjs", "--update", "--json", "--no-report"]);
      expect(JSON.parse(updated.stdout)).toMatchObject({ updated: true, matches: true });
      expect(await readFile(expectedPath, "utf8")).not.toContain("consumer@example.test");

      const checked = await runBin(["announce-check.config.mjs", "--json", "--no-report"]);
      expect(JSON.parse(checked.stdout)).toMatchObject({ updated: false, matches: true });

      submitValue = "Register now";
      const changed = await runBin(["announce-check.config.mjs", "--json", "--no-report"]).catch((error: unknown) => error as { code: number; stdout: string });
      expect(changed).toMatchObject({ code: 1 });
      expect(JSON.parse(changed.stdout)).toMatchObject({
        matches: false,
        diff: {
          firstDifference: 1,
          expected: { kind: "focus", text: "Create account — button" },
          received: { kind: "focus", text: "Register now — button" }
        }
      });
    } finally {
      submitValue = "Create account";
      await rm(consumer, { recursive: true, force: true });
      if (tarball) await rm(tarball, { force: true });
    }
  }, 90_000);
});
