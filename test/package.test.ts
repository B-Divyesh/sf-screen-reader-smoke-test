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
let imageAlt = "Create account";
let fixtureMode: "input" | "image" = "input";
const fixture = () => `<!doctype html><html lang="en"><head><title>Signup fixture</title></head><body>
<main><h1>Create an account</h1><form><label for="email">Email address</label><input id="email" type="email" required><input type="submit" value="${submitValue}"></form><p role="status"></p></main>
<script>document.querySelector('form').addEventListener('submit',event=>{event.preventDefault();document.querySelector('[role=status]').textContent='Account created for '+document.querySelector('input').value})</script>
</body></html>`;

const imageButtonFixture = () => `<!doctype html><html lang="en"><head><title>Image button fixture</title></head><body>
<main><h1>Create an account</h1><form><label for="email">Email address</label><input id="email" type="email" required><button id="submit" type="submit"><img alt="${imageAlt}" src="/create-account.svg"></button></form><p role="status"></p></main>
<script>document.querySelector('form').addEventListener('submit',event=>{event.preventDefault();document.querySelector('[role=status]').textContent='Account created for '+document.querySelector('input').value})</script>
</body></html>`;

let server: ReturnType<typeof createServer>;
let origin: string;

beforeAll(async () => {
  server = createServer(async (request, response) => {
    if (request.url === "/screen-reader-smoke-test-0.1.0.tgz") {
      try {
        const tarball = await readFile(join(repository, "dist", "site", "downloads", "screen-reader-smoke-test-0.1.0.tgz"));
        response.writeHead(200, { "content-type": "application/octet-stream" });
        response.end(tarball);
      } catch {
        response.writeHead(404).end();
      }
      return;
    }
    if (request.url === "/create-account.svg") {
      response.writeHead(200, { "content-type": "image/svg+xml" });
      response.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>');
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixtureMode === "image" ? imageButtonFixture() : fixture());
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Fixture server did not bind.");
  origin = `http://127.0.0.1:${address.port}`;
});

describe("published package consumer with an image-named native button", () => {
  it("fails the packed CLI check when the descendant image alt changes", async () => {
    const consumer = await mkdtemp(join(tmpdir(), "announce-test-image-consumer-"));
    let tarball: string | undefined;
    fixtureMode = "image";
    try {
      await execFileAsync("npm", ["run", "build"], { cwd: repository });
      const { stdout } = await execFileAsync("npm", ["pack", "--json", "--ignore-scripts"], { cwd: repository });
      const packed = JSON.parse(stdout) as Array<{ filename: string }>;
      tarball = join(repository, packed[0]!.filename);

      await execFileAsync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--no-package-lock", tarball], { cwd: consumer });
      const configPath = join(consumer, "announce-check.config.mjs");
      await writeFile(configPath, `export default {
        name: "Packaged image button",
        url: "${origin}",
        expectedPath: "./announce-check.expected.json",
        steps: [
          { action: "click", target: { selector: "#submit" } },
          { action: "wait", for: 60 }
        ]
      };`);

      const bin = join(consumer, "node_modules", ".bin", "announce-check");
      const runBin = (args: string[]) => execFileAsync(process.execPath, [bin, ...args], { cwd: consumer });

      const updated = await runBin(["announce-check.config.mjs", "--update", "--json", "--no-report"]);
      expect(JSON.parse(updated.stdout)).toMatchObject({ updated: true, matches: true });

      imageAlt = "Register now";
      const changed = await runBin(["announce-check.config.mjs", "--json", "--no-report"]).catch((error: unknown) => error as { code: number; stdout: string });
      expect(changed).toMatchObject({ code: 1 });
      expect(JSON.parse(changed.stdout)).toMatchObject({
        matches: false,
        diff: {
          firstDifference: 0,
          expected: { kind: "focus", text: "Create account — button" },
          received: { kind: "focus", text: "Register now — button" }
        }
      });
    } finally {
      imageAlt = "Create account";
      fixtureMode = "input";
      await rm(consumer, { recursive: true, force: true });
      if (tarball) await rm(tarball, { force: true });
    }
  }, 90_000);
});

afterAll(async () => {
  await new Promise<void>((done, fail) => server.close((error) => error ? fail(error) : done()));
});

describe("published package consumer", () => {
  it("@claim:download-package @claim:cli-exit-codes @claim:ci-recheck @claim:cli-output-modes @claim:package-formats installs the site tarball and runs every package entry without prompts", async () => {
    const consumer = await mkdtemp(join(tmpdir(), "announce-test-consumer-"));
    try {
      await execFileAsync("npm", ["run", "build"], { cwd: repository });
      const tarball = join(repository, "dist", "site", "downloads", "screen-reader-smoke-test-0.1.0.tgz");
      const builtHome = await readFile(join(repository, "dist", "site", "index.html"), "utf8");
      expect(builtHome).toContain("https://screen-reader-smoke-test.sociobot.in/downloads/screen-reader-smoke-test-0.1.0.tgz");
      expect((await lstat(tarball)).isFile()).toBe(true);

      await execFileAsync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--no-package-lock", `${origin}/screen-reader-smoke-test-0.1.0.tgz`], { cwd: consumer });
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
      const esm = await execFileAsync(process.execPath, ["--input-type=module", "-e", "import { compareTranscripts } from 'screen-reader-smoke-test'; console.log(compareTranscripts([], []).matches)"], { cwd: consumer });
      expect(esm.stdout.trim()).toBe("true");
      const commonJs = await execFileAsync(process.execPath, ["-e", "console.log(require('screen-reader-smoke-test').compareTranscripts([], []).matches)"], { cwd: consumer });
      expect(commonJs.stdout.trim()).toBe("true");
      expect(await readFile(join(consumer, "node_modules", "screen-reader-smoke-test", "dist", "library", "index.d.ts"), "utf8")).toContain("declare function runCheck");
      const help = await runBin(["--help"]);
      expect(help.stdout).toContain("Verify keyboard-focus and ARIA status-message changes");

      const updated = await runBin(["announce-check.config.mjs", "--update", "--json", "--no-report"]);
      expect(JSON.parse(updated.stdout)).toMatchObject({ updated: true, matches: true });
      expect(await readFile(expectedPath, "utf8")).not.toContain("consumer@example.test");

      const checked = await runBin(["announce-check.config.mjs", "--json", "--no-report"]);
      expect(JSON.parse(checked.stdout)).toMatchObject({ updated: false, matches: true });

      const defaultReport = await runBin(["announce-check.config.mjs", "--json"]);
      expect(JSON.parse(defaultReport.stdout)).toMatchObject({ updated: false, matches: true });
      expect((await lstat(join(consumer, "announce-check-report", "index.html"))).isFile()).toBe(true);
      const customReport = join(consumer, "chosen-report");
      const customOutput = await runBin(["announce-check.config.mjs", "--json", "--report", customReport]);
      expect(JSON.parse(customOutput.stdout)).toMatchObject({ updated: false, matches: true });
      expect((await lstat(join(customReport, "index.html"))).isFile()).toBe(true);
      await rm(join(consumer, "announce-check-report"), { recursive: true, force: true });
      const noReport = await runBin(["announce-check.config.mjs", "--json", "--no-report"]);
      expect(JSON.parse(noReport.stdout)).toMatchObject({ updated: false, matches: true });
      await expect(lstat(join(consumer, "announce-check-report", "index.html"))).rejects.toMatchObject({ code: "ENOENT" });

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
      const invalid = await runBin(["--unknown"]).catch((error: unknown) => error as { code: number; stderr: string });
      expect(invalid).toMatchObject({ code: 2 });
      expect(invalid.stderr).toContain("Unknown option");
    } finally {
      submitValue = "Create account";
      await rm(consumer, { recursive: true, force: true });
    }
  }, 90_000);
});
